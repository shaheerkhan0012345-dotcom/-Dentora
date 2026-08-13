import React from 'react';
import { AIChatPage } from '../../copilot/AIChatPage';

interface AIAssistantTabProps {
  userRole?: string;
  userName?: string;
  userAvatar?: string;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  userRole = 'Doctor',
  userName = 'Dr. Elena Rostova',
  userAvatar,
}) => {
  return (
    <div className="w-full">
      <AIChatPage userRole={userRole} userName={userName} userAvatar={userAvatar} />
    </div>
  );
};
