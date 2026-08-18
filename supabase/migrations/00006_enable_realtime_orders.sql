-- Enable Realtime publication on orders table for admin live notifications
ALTER PUBLICATION supabase_realtime ADD TABLE orders;