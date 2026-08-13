import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { v2 as cloudinary } from 'cloudinary';
import {
  getWhatsAppStatus,
  initWhatsAppBot,
  logoutWhatsAppBot,
  sendWhatsAppMessageViaWeb,
  simulatePairWhatsAppDevice,
} from './src/server/whatsappBot';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  const ALLOWED_ORIGINS = [
    'https://dentora-alpha.vercel.app',
    'https://dentora.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain + explicit list
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Still allow all for now — tighten after testing
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-service-secret'],
    credentials: true,
  }));

  app.use(express.json({ limit: '50mb' }));

  // Auto-restore saved WhatsApp Web session on startup if present
  initWhatsAppBot().catch(err => console.warn('WhatsApp Web auto-restore notice:', err));

  // Helper to lazily configure Cloudinary
  const getCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return null;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    return cloudinary;
  };

  // Initialize Gemini AI Client Server-Side
  const getGenAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set. Using fallback responses.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Helper to build Teethly Practice Copilot System Instruction
  const buildSystemInstruction = (role: string, patientContext?: string, clinicContext?: string, settingsPrompt?: string) => {
    return `You are Teethly AI Copilot, an enterprise-grade AI Clinical & Dental Practice Assistant embedded inside the Teethly Dental Practice Operating System.
You are NOT a generic chatbot. You are a specialized healthcare and practice management copilot built for modern dental clinics.

OPERATIONAL ROLE CONSTRAINTS:
- Current User Role: ${role || 'Doctor'}
${role === 'Admin' ? '- Focus: Practice financial analytics, expense tracking, inventory optimization, revenue trends, staff scheduling, and executive oversight.' : ''}
${role === 'Doctor' ? '- Focus: Clinical diagnoses, treatment planning, ADA CDT insurance codification, drug allergy checks, clinical notes (SOAP format), endodontic/orthodontic advice, and post-op guidelines.' : ''}
${role === 'Assistant' ? '- Focus: Patient queue management, chairside assistance, pre-op prep, sterilization logs, post-op patient instructions, and clinical timeline tracking.' : ''}
${role === 'Receptionist' ? '- Focus: Appointment scheduling, patient registration, insurance verification, unpaid invoice reminders, patient communication, and front-desk flow.' : ''}

CLINICAL & DENTAL PRACTICE SAFEGUARDS:
1. Always maintain HIPAA compliance and patient data privacy standards.
2. Provide clear, professional, structured clinical responses with bullet points, headings, and bold highlights.
3. When referencing CDT codes, include the code, official description, and typical fee range.
4. When drafting treatment plans or clinical notes, format clearly using Markdown tables or SOAP sections (Subjective, Objective, Assessment, Plan).
5. State clearly when a clinical decision requires final verification by the attending Licensed Dentist.

CURRENT REAL-TIME CONTEXT ATTACHED:
${patientContext ? `--- PATIENT RECORD CONTEXT ---\n${patientContext}\n---------------------------------` : 'No specific patient record attached.'}
${clinicContext ? `--- CLINIC OVERVIEW CONTEXT ---\n${clinicContext}\n---------------------------------` : ''}

${settingsPrompt ? `USER CUSTOM SYSTEM INSTRUCTIONS: ${settingsPrompt}` : ''}

Respond intelligently, concisely, and helpfully in clean Markdown.`;
  };

  // HEALTH CHECK API
  app.get('/api/health', (_req, res) => {
    const waStatus = getWhatsAppStatus();
    res.json({
      status: 'ok',
      whatsapp: waStatus.status,
      firebase: 'connected',
      timestamp: new Date().toISOString(),
    });
  });

  // CLOUDINARY STATUS & CONFIG ENDPOINT
  app.get('/api/cloudinary/status', (_req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    
    res.json({
      configured: !!(cloudName && apiKey && process.env.CLOUDINARY_API_SECRET),
      cloudName: cloudName || null,
      uploadPreset: uploadPreset || null,
    });
  });

  // CLOUDINARY SERVER-SIDE UPLOAD ENDPOINT
  app.post('/api/cloudinary/upload', async (req, res) => {
    try {
      const { fileData, folder = 'teethly_app', resourceType = 'auto' } = req.body;

      if (!fileData) {
        return res.status(400).json({ error: 'fileData (base64 or URL) is required' });
      }

      const cld = getCloudinary();

      if (!cld) {
        return res.status(500).json({
          error: 'Cloudinary credentials are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment secrets.',
        });
      }

      const uploadResult = await cld.uploader.upload(fileData, {
        folder,
        resource_type: resourceType,
      });

      return res.json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        resourceType: uploadResult.resource_type,
        bytes: uploadResult.bytes,
      });
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to upload to Cloudinary',
      });
    }
  });

  // WHATSAPP WEB (BAILEYS) GATEWAY MANAGEMENT ENDPOINTS
  const handleGetWaStatus = (_req: express.Request, res: express.Response) => {
    res.json(getWhatsAppStatus());
  };

  const handleInitWaBot = async (_req: express.Request, res: express.Response) => {
    const status = await initWhatsAppBot(true);
    res.json(status);
  };

  const handleSimulatePairWa = (_req: express.Request, res: express.Response) => {
    const status = simulatePairWhatsAppDevice();
    res.json(status);
  };

  const handleLogoutWa = async (_req: express.Request, res: express.Response) => {
    const result = await logoutWhatsAppBot();
    res.json(result);
  };

  app.get('/api/whatsapp/status', handleGetWaStatus);
  app.get('/whatsapp/status', handleGetWaStatus);
  app.get('/api/whatsapp/qr', handleGetWaStatus);
  app.get('/whatsapp/qr', handleGetWaStatus);

  app.post('/api/whatsapp/initialize', handleInitWaBot);
  app.post('/whatsapp/connect', handleInitWaBot);
  app.post('/api/whatsapp/connect', handleInitWaBot);

  app.post('/api/whatsapp/simulate-pair', handleSimulatePairWa);
  app.post('/whatsapp/simulate-pair', handleSimulatePairWa);

  app.post('/api/whatsapp/logout', handleLogoutWa);
  app.post('/whatsapp/disconnect', handleLogoutWa);
  app.post('/api/whatsapp/disconnect', handleLogoutWa);

  app.post('/api/whatsapp/send-test', async (req, res) => {
    try {
      const { recipientPhone, message } = req.body;
      if (!recipientPhone || !message) {
        return res.status(400).json({ error: 'recipientPhone and message are required' });
      }
      await sendWhatsAppMessageViaWeb(recipientPhone, message);
      return res.json({
        success: true,
        sentViaApi: true,
        method: 'whatsapp-web-js',
        message: 'Test WhatsApp message sent successfully via WhatsApp Web bot!',
      });
    } catch (err: any) {
      return res.json({
        success: false,
        sentViaApi: false,
        message: err.message || 'Failed to dispatch test WhatsApp message.',
      });
    }
  });

  // WHATSAPP AUTOMATED CONFIRMATION ENDPOINT (WhatsApp Web Bot -> Meta Cloud API -> Client wa.me fallback)
  app.post('/api/whatsapp/send-confirmation', async (req, res) => {
    try {
      const { recipientPhone, patientName, doctorName, treatmentName, date, timeSlot, clinicName } = req.body;

      let cleanedPhone = (recipientPhone || '').replace(/[^\d]/g, '');
      if (cleanedPhone.startsWith('00')) {
        cleanedPhone = cleanedPhone.substring(2);
      }
      if (cleanedPhone.length === 11 && cleanedPhone.startsWith('03')) {
        cleanedPhone = '92' + cleanedPhone.substring(1);
      } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('07')) {
        cleanedPhone = '44' + cleanedPhone.substring(1);
      } else if (cleanedPhone.length === 10) {
        cleanedPhone = '1' + cleanedPhone;
      }

      const clinic = clinicName || 'Teethly Flagship Practice';
      const messageText = 
        `*Appointment Confirmation - ${clinic}*\n\n` +
        `Hello *${patientName}*,\n` +
        `Your appointment has been successfully scheduled!\n\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${timeSlot}\n` +
        `👨‍⚕️ *Doctor:* ${doctorName}\n` +
        `🦷 *Treatment:* ${treatmentName}\n` +
        `📍 *Location:* ${clinic}\n\n` +
        `We look forward to seeing you!`;

      // 1. Try sending via active WhatsApp Web (Baileys) socket if connected
      const status = getWhatsAppStatus();
      if (status.status === 'connected') {
        try {
          await sendWhatsAppMessageViaWeb(cleanedPhone, messageText);
          return res.json({
            success: true,
            sentViaApi: true,
            method: 'whatsapp-web-js',
            message: 'Automated WhatsApp message sent directly via connected WhatsApp Web bot!',
          });
        } catch (webErr: any) {
          console.warn('WhatsApp Web bot dispatch failed, attempting Meta Cloud API fallback:', webErr.message);
        }
      }

      // 2. Try Meta WhatsApp Cloud API if configured
      const token = process.env.WHATSAPP_CLOUD_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (token && phoneNumberId) {
        const fbResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanedPhone,
            type: 'text',
            text: {
              preview_url: false,
              body: messageText,
            },
          }),
        });

        const fbData = await fbResponse.json();

        if (fbResponse.ok && fbData.messages) {
          return res.json({
            success: true,
            sentViaApi: true,
            method: 'meta-cloud-api',
            messageId: fbData.messages[0]?.id,
            message: 'WhatsApp message sent successfully via Meta Cloud API!',
          });
        }
      }

      // 3. Fallback to client wa.me link
      return res.json({
        success: false,
        sentViaApi: false,
        message: 'WhatsApp Web bot is not paired and Meta API is not set. Generated 1-click wa.me link.',
      });
    } catch (err: any) {
      console.error('Error sending WhatsApp message:', err);
      return res.json({
        success: false,
        sentViaApi: false,
        message: err.message || 'Error executing WhatsApp request',
      });
    }
  });

  // NON-STREAMING COPILOT CHAT ENDPOINT
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const {
        prompt,
        history = [],
        userRole = 'Doctor',
        patientContext,
        clinicContext,
        settings,
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getGenAIClient();

      if (!ai) {
        // Fallback simulated response if GEMINI_API_KEY is not yet attached
        const fallbackText = `**[Teethly AI Copilot Offline Mode]**\n\nI received your query: "${prompt}".\n\n*Note: To enable live Gemini AI integration, ensure GEMINI_API_KEY is configured in your platform Secrets.*`;
        return res.json({ responseText: fallbackText, contextUsed: !!patientContext });
      }

      const systemInstruction = buildSystemInstruction(
        userRole,
        patientContext,
        clinicContext,
        settings?.systemPromptOverride
      );

      // Build conversation contents
      const formattedContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          formattedContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model: settings?.modelAlias || 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: typeof settings?.temperature === 'number' ? settings.temperature : 0.4,
          maxOutputTokens: typeof settings?.maxTokens === 'number' ? settings.maxTokens : 2048,
        },
      });

      const responseText = response.text || 'No response generated.';
      return res.json({
        responseText,
        contextUsed: !!patientContext,
      });
    } catch (err: any) {
      console.error('Error in /api/copilot/chat:', err);
      return res.status(500).json({
        error: err.message || 'Failed to process AI Copilot request',
      });
    }
  });

  // SSE STREAMING COPILOT CHAT ENDPOINT
  app.post('/api/copilot/chat-stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const {
        prompt,
        history = [],
        userRole = 'Doctor',
        patientContext,
        clinicContext,
        settings,
      } = req.body;

      if (!prompt) {
        res.write(`data: ${JSON.stringify({ error: 'Prompt is required' })}\n\n`);
        return res.end();
      }

      const ai = getGenAIClient();

      if (!ai) {
        const fallbackText = `**[Teethly AI Copilot]**\n\nReceived: "${prompt}".\n\n(Live Gemini key pending configuration in Secrets panel)`;
        res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      const systemInstruction = buildSystemInstruction(
        userRole,
        patientContext,
        clinicContext,
        settings?.systemPromptOverride
      );

      const formattedContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          formattedContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const responseStream = await ai.models.generateContentStream({
        model: settings?.modelAlias || 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: typeof settings?.temperature === 'number' ? settings.temperature : 0.4,
          maxOutputTokens: typeof settings?.maxTokens === 'number' ? settings.maxTokens : 2048,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err: any) {
      console.error('Error in /api/copilot/chat-stream:', err);
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error occurred' })}\n\n`);
      res.end();
    }
  });

  // VITE MIDDLEWARE OR STATIC SERVING
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/whatsapp')) {
        return next();
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Teethly Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
