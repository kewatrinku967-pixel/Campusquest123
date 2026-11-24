insert into public.puzzle_stages
(id, title, description, puzzle_content, points, sort_order)
values
(1, 'The Encrypted Message',
 'Decode the intercepted message.',
 '{"cipher":"DIFDL UIF UJNFTUBNQ","instruction":"Decode the message and enter the key word."}',
 10, 1),

(2, 'The Digital Footprint',
 'Investigate the archive activity log.',
 '{"events":[
   {"time":"14:03","event":"Archive login"},
   {"time":"14:11","event":"Project Aster opened"},
   {"time":"14:15","event":"Suspicious access event"},
   {"time":"14:19","event":"Archive activity log updated"}
 ],
 "instruction":"Enter the suspicious access time in 24-hour HHMM format."}',
 15, 2),

(3, 'The Access Card',
 'Identify the owner of badge K-17.',
 '{"badge":"K-17","instruction":"Enter the suspect first name."}',
 20, 3),

(4, 'The Lost Badge',
 'Check the badge incident report.',
 '{"report":[
   {"time":"13:50","event":"Badge K-17 reported missing"},
   {"time":"14:10","event":"Kabir recorded at seminar attendance"}
 ],
 "instruction":"Enter the reported status of badge K-17."}',
 25, 4),

(5, 'The Final Verdict',
 'Use the final account audit to identify who moved the file.',
 '{"events":[
   {"time":"14:12","event":"MIRA-02 logged in"},
   {"time":"14:13","event":"MIRA-02 received registered-device verification approval"},
   {"time":"14:14","event":"Project Aster opened"},
   {"time":"14:16","event":"Project Aster moved to ARCHIVE_DRAFTS"}
 ],
 "instruction":"Submit the suspect first name and destination folder."}',
 30, 5);

insert into public.puzzle_answers(stage_id, accepted_answers)
values
(1, array['TIMESTAMP']),
(2, array['1415']),
(3, array['KABIR']),
(4, array['MISSING']),
(5, array['MIRA|ARCHIVE_DRAFTS']);
