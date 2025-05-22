-- Seed prompts for ParentPrompt (Task 5.1)
-- Run this migration to insert initial prompt data into the public.prompts table

INSERT INTO public.prompts (content, type, age_range, tags)
VALUES
  ('Read a book with {childName} today. Ask them to point out their favorite pictures and talk about why they like them.',
   'activity',
   ARRAY['2-4 years'],
   ARRAY['reading', 'language', 'bonding']),

  ('Sing {childName}''s favorite song together and make up silly dance moves.',
   'activity',
   ARRAY['1-3 years'],
   ARRAY['music', 'movement', 'bonding']),

  ('Take {childName} outside and look for bugs or interesting plants. Talk about what you find.',
   'activity',
   ARRAY['2-5 years'],
   ARRAY['outdoors', 'nature', 'science', 'observation']),

  ('Build a fort with {childName} using blankets and pillows. Read a story inside your new special place.',
   'activity',
   ARRAY['3-5 years'],
   ARRAY['imagination', 'construction', 'reading', 'bonding']),

  ('Cook a simple snack with {childName}. Let them help mix ingredients and talk about how things change when they''re combined.',
   'activity',
   ARRAY['3-5 years'],
   ARRAY['cooking', 'science', 'motor skills', 'teamwork']),

  ('Have a ''color hunt'' with {childName}. Pick a color and find objects of that color around your home.',
   'activity',
   ARRAY['2-4 years'],
   ARRAY['colors', 'observation', 'movement']),

  ('Play ''follow the leader'' with {childName}, taking turns being the leader.',
   'activity',
   ARRAY['2-5 years'],
   ARRAY['movement', 'leadership', 'imitation']),

  ('Draw pictures together and tell stories about what you''ve drawn.',
   'activity',
   ARRAY['2-5 years'],
   ARRAY['art', 'storytelling', 'creativity']),

  ('Teach {childName} a simple card game or board game appropriate for their age.',
   'activity',
   ARRAY['4-6 years'],
   ARRAY['games', 'strategy', 'turn-taking', 'social skills']); 