import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Check if Pusher environment variables are set
const isPusherConfigured = process.env.PUSHER_APP_ID && 
                          process.env.PUSHER_KEY && 
                          process.env.PUSHER_SECRET && 
                          process.env.PUSHER_CLUSTER;

export const pusher = isPusherConfigured ? new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
}) : null;

export const pusherClient = isPusherConfigured ? new PusherClient(process.env.PUSHER_KEY, {
  cluster: process.env.PUSHER_CLUSTER,
}) : null; 