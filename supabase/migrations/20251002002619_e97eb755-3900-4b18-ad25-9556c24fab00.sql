-- Enable realtime for profiles table so avatar changes update live
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;