import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import s from './Messages.module.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setMessages(data);
  };

  const markAsRead = async (id) => {
    await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);
    fetchMessages();
  };

  return (
    <div className={s.container}>
      <div className={s.list}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${s.card} ${msg.status === 'unread' ? s.unread : ''}`}>
            <div className={s.cardHeader}>
              <h4>{msg.name} <span>({msg.email})</span></h4>
              <p>{new Date(msg.created_at).toLocaleDateString()}</p>
            </div>
            <p className={s.subject}>Subject: {msg.subject}</p>
            <p className={s.body}>{msg.message}</p>
            <div className={s.actions}>
              {msg.status === 'unread' && (
                <button onClick={() => markAsRead(msg.id)} className={s.readBtn}>
                  Mark as Read <FontAwesomeIcon icon={faCheckCircle} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;