import React from 'react';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  conversations = [],
  activeId,
  onSelect,
  onRename,
  onDelete,
}) {
  const todayConvs = conversations.filter(
    (c) => c.timestamp === 'TODAY' || !c.timestamp
  );

  const olderConvs = conversations.filter(
    (c) => c.timestamp !== 'TODAY' && c.timestamp
  );

  const getConvId = (conv) =>
    conv.convId || conv.id || conv._id;

  return (
    <div className="space-y-4">
      {todayConvs.length > 0 && (
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Today
          </p>

          {todayConvs.map((conv) => {
            const cid = getConvId(conv);

            return (
              <ConversationItem
                key={cid}
                conversation={conv}
                isActive={activeId === cid}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}

      {olderConvs.length > 0 && (
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Previous Conversations
          </p>

          {olderConvs.map((conv) => {
            const cid = getConvId(conv);

            return (
              <ConversationItem
                key={cid}
                conversation={conv}
                isActive={activeId === cid}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

    