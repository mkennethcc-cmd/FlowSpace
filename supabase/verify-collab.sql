-- ═══════════════════════════════════════════════════════════════════════════
--  Freely · collaboration self-test
--  Run supabase/setup.sql first. Then paste this into Supabase → SQL Editor → Run,
--  and send me the result table.
--
--  It pretends to BE each of your two accounts and really performs every
--  collaboration action, so it proves the security rules behave correctly.
--  Everything it creates is deleted again at the end; your real teams,
--  messages and requests are never touched.
-- ═══════════════════════════════════════════════════════════════════════════

create temp table if not exists _fr(n serial, step text, result text);
truncate _fr;

do $$
declare
  a_mail   text := 'kc6246@nyu.edu';
  b_mail   text := 'mkenneth.cc@outlook.com';
  a_id     uuid;
  b_id     uuid;
  orig     text := current_user;
  mark     text := '__freely_selftest__';
  gid      bigint;
  cnt      int;
  made_req boolean := false;
  tid      uuid := gen_random_uuid();
  tid2     uuid := gen_random_uuid();
  nid      uuid := gen_random_uuid();
  res      text[] := '{}';
begin
  select id into a_id from auth.users where lower(email) = a_mail;
  select id into b_id from auth.users where lower(email) = b_mail;

  if a_id is null then res := res || ('account ' || a_mail || ' | ✗ not found — sign in once with it first'); end if;
  if b_id is null then res := res || ('account ' || b_mail || ' | ✗ not found — sign in once with it first'); end if;

  if a_id is not null and b_id is not null then

    ---------------------------------------------------------------- act as A
    execute 'set local role ' || quote_ident(orig);
    perform set_config('request.jwt.claims', json_build_object('sub', a_id::text, 'email', a_mail)::text, true);
    execute 'set local role authenticated';

    begin
      insert into public.groups(name, icon, created_by) values (mark, '🧪', a_id) returning id into gid;
      res := res || ('1. A creates a team | ✓ PASS')::text;
    exception when others then res := res || ('1. A creates a team | ✗ FAIL: ' || sqlerrm); end;

    if gid is not null then
      begin
        insert into public.group_members(group_id, email, added_by) values (gid, a_mail, a_mail);
        res := res || ('2. A joins the team they made | ✓ PASS')::text;
      exception when others then res := res || ('2. A joins the team they made | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.group_members(group_id, email, added_by) values (gid, b_mail, a_mail);
        res := res || ('3. A pulls B into the team | ✓ PASS')::text;
      exception when others then res := res || ('3. A pulls B into the team | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.messages(sender_id, sender_email, recipient_email, group_id, body)
        values (a_id, a_mail, null, gid, mark || ' team hello');
        res := res || ('4. A posts in the team chat | ✓ PASS')::text;
      exception when others then res := res || ('4. A posts in the team chat | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.messages(sender_id, sender_email, recipient_email, body)
        values (a_id, a_mail, b_mail, mark || ' direct hello');
        res := res || ('5. A sends B a direct message | ✓ PASS')::text;
      exception when others then res := res || ('5. A sends B a direct message | ✗ FAIL: ' || sqlerrm); end;

      -- only file a request if there is no real one already, so nothing of yours is disturbed
      begin
        insert into public.chat_requests(from_email, to_email, status) values (a_mail, b_mail, 'pending');
        made_req := true;
        res := res || ('6. A files a friend request | ✓ PASS')::text;
      exception
        when unique_violation then res := res || ('6. A files a friend request | — skipped (a real request already exists)')::text;
        when others then res := res || ('6. A files a friend request | ✗ FAIL: ' || sqlerrm);
      end;

      ---------------------------------------------------------------- act as B
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', b_id::text, 'email', b_mail)::text, true);
      execute 'set local role authenticated';

      select count(*) into cnt from public.messages where group_id = gid;
      res := res || ('7. B reads the team chat | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: sees nothing' end);

      begin
        insert into public.messages(sender_id, sender_email, recipient_email, group_id, body)
        values (b_id, b_mail, null, gid, mark || ' team reply');
        res := res || ('8. B replies in the team chat | ✓ PASS')::text;
      exception when others then res := res || ('8. B replies in the team chat | ✗ FAIL: ' || sqlerrm); end;

      select count(*) into cnt from public.messages
        where group_id is null and body like mark || '%' and recipient_email = b_mail;
      res := res || ('9. B reads A''s direct message | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: sees nothing' end);

      if made_req then
        begin
          update public.chat_requests set status = 'accepted' where from_email = a_mail and to_email = b_mail;
          get diagnostics cnt = row_count;
          res := res || ('10. B accepts the request | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: blocked' end);
        exception when others then res := res || ('10. B accepts the request | ✗ FAIL: ' || sqlerrm); end;
      end if;

      begin
        insert into public.messages(sender_id, sender_email, recipient_email, body)
        values (b_id, b_mail, a_mail, mark || ' direct reply');
        res := res || ('11. B replies directly to A | ✓ PASS')::text;
      exception when others then res := res || ('11. B replies directly to A | ✗ FAIL: ' || sqlerrm); end;

      ------------------------------------------------- a stranger must see none
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims',
        json_build_object('sub', '00000000-0000-0000-0000-0000000000ff', 'email', 'stranger@example.com')::text, true);
      execute 'set local role authenticated';

      select count(*) into cnt from public.messages where group_id = gid;
      res := res || ('12. A stranger CANNOT read the team chat | '
                     || case when cnt = 0 then '✓ PASS' else ('✗ FAIL: leaked ' || cnt) end);

      select count(*) into cnt from public.messages where group_id is null and body like mark || '%';
      res := res || ('13. A stranger CANNOT read your DMs | '
                     || case when cnt = 0 then '✓ PASS' else ('✗ FAIL: leaked ' || cnt) end);

      select count(*) into cnt from public.groups where id = gid;
      res := res || ('14. A stranger CANNOT even see the team | '
                     || case when cnt = 0 then '✓ PASS' else '✗ FAIL: team is public' end);

      ------------------------------------------- guest invited only to assign work
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', a_id::text, 'email', a_mail)::text, true);
      execute 'set local role authenticated';
      begin
        insert into public.group_members(group_id, email, added_by, role)
        values (gid, 'stranger@example.com', a_mail, 'assigner');
        res := res || ('15. A invites a guest (assign-only) | ✓ PASS')::text;
      exception when others then res := res || ('15. A invites a guest (assign-only) | ✗ FAIL: ' || sqlerrm); end;

      -- a task in a list that was never shared, handed to B
      begin
        insert into public.tasks(id, user_id, title, tag, assigned_to)
        values (gen_random_uuid(), a_id, mark || ' open job', mark, b_mail);
        insert into public.tasks(id, user_id, title, tag, assigned_to, assign_private)
        values (gen_random_uuid(), a_id, mark || ' private job', mark, b_mail, true);
        res := res || ('16. A assigns B work in an unshared list | ✓ PASS')::text;
      exception when others then res := res || ('16. A assigns B work in an unshared list | ✗ FAIL: ' || sqlerrm); end;

      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims',
        json_build_object('sub', '00000000-0000-0000-0000-0000000000ff', 'email', 'stranger@example.com')::text, true);
      execute 'set local role authenticated';

      select count(*) into cnt from public.groups where id = gid;
      res := res || ('17. The guest CAN see the team (to assign to it) | '
                     || case when cnt > 0 then '✓ PASS' else '✗ FAIL: invisible' end);

      select count(*) into cnt from public.messages where group_id = gid;
      res := res || ('18. The guest still CANNOT read the team chat | '
                     || case when cnt = 0 then '✓ PASS' else ('✗ FAIL: leaked ' || cnt) end);

      select count(*) into cnt from public.tasks where title like mark || '%';
      res := res || ('19. The guest CANNOT see either assigned task | '
                     || case when cnt = 0 then '✓ PASS' else ('✗ FAIL: leaked ' || cnt) end);

      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', b_id::text, 'email', b_mail)::text, true);
      execute 'set local role authenticated';

      select count(*) into cnt from public.tasks where title like mark || '%' and assign_private = false;
      res := res || ('20. B sees work assigned to them (list never shared) | '
                     || case when cnt > 0 then '✓ PASS' else '✗ FAIL: invisible' end);

      select count(*) into cnt from public.tasks where title like mark || '%' and assign_private = true;
      res := res || ('21. B sees the PRIVATE task assigned to them | '
                     || case when cnt > 0 then '✓ PASS' else '✗ FAIL: invisible' end);

      ------------------------- A shares a list with B; B hands work to a third person
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', a_id::text, 'email', a_mail)::text, true);
      execute 'set local role authenticated';

      begin
        insert into public.folder_shares(owner_id, folder, shared_with_email, can_delete)
        values (a_id, mark, b_mail, false);
        res := res || ('22. A shares a list with B (no re-share rights) | ✓ PASS')::text;
      exception when others then res := res || ('22. A shares a list with B (no re-share rights) | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.tasks(id, user_id, title, tag)
        values (tid, a_id, mark || ' shared job', mark);
        res := res || ('23. A puts a task in that shared list | ✓ PASS')::text;
      exception when others then res := res || ('23. A puts a task in that shared list | ✗ FAIL: ' || sqlerrm); end;

      -- B now assigns a third person, C, who has NO share on the list
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', b_id::text, 'email', b_mail)::text, true);
      execute 'set local role authenticated';

      begin
        update public.tasks set assigned_to = 'stranger@example.com' where id = tid;
        get diagnostics cnt = row_count;
        res := res || ('24. B assigns C on A''s task | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: update touched 0 rows' end);
      exception when others then res := res || ('24. B assigns C on A''s task | ✗ FAIL: ' || sqlerrm); end;

      -- did it actually persist, or did it only look saved on B's screen?
      execute 'set local role ' || quote_ident(orig);
      select count(*) into cnt from public.tasks where id = tid and assigned_to = 'stranger@example.com';
      res := res || ('25. ...and it really saved to the database | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: not stored' end);

      perform set_config('request.jwt.claims',
        json_build_object('sub', '00000000-0000-0000-0000-0000000000ff', 'email', 'stranger@example.com')::text, true);
      execute 'set local role authenticated';

      select count(*) into cnt from public.tasks where id = tid;
      res := res || ('26. C can see the task assigned to them | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: invisible to C' end);

      ------------------------------------------- a VIEW-ONLY share: B can look, not touch
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', a_id::text, 'email', a_mail)::text, true);
      execute 'set local role authenticated';
      begin
        insert into public.folder_shares(owner_id, folder, shared_with_email, can_delete, can_edit)
        values (a_id, mark || ' ro', b_mail, false, false);
        insert into public.tasks(id, user_id, title, tag) values (tid2, a_id, mark || ' read-only job', mark || ' ro');
        res := res || ('27. A shares a list VIEW-ONLY with B | ✓ PASS')::text;
      exception when others then res := res || ('27. A shares a list VIEW-ONLY with B | ✗ FAIL: ' || sqlerrm); end;

      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', b_id::text, 'email', b_mail)::text, true);
      execute 'set local role authenticated';

      select count(*) into cnt from public.tasks where id = tid2;
      res := res || ('28. B can SEE the view-only task | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: invisible' end);

      begin
        update public.tasks set done = true where id = tid2;
        get diagnostics cnt = row_count;
        res := res || ('29. B CANNOT change it | ' || case when cnt = 0 then '✓ PASS' else '✗ FAIL: the change went through' end);
      exception when others then res := res || ('29. B CANNOT change it | ✓ PASS')::text; end;

      begin
        insert into public.tasks(id, user_id, title, tag) values (gen_random_uuid(), a_id, mark || ' sneaked in', mark || ' ro');
        res := res || ('30. B CANNOT add to it | ✗ FAIL: the insert went through')::text;
      exception when others then res := res || ('30. B CANNOT add to it | ✓ PASS')::text; end;

      ------------------- saving your own notes and lists the way the app now does (insert, then update)
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', a_id::text, 'email', a_mail)::text, true);
      execute 'set local role authenticated';
      begin
        insert into public.notes(id, user_id, title) values (nid, a_id, mark || ' note')
          on conflict (id) do update set title = excluded.title;
        insert into public.notes(id, user_id, title) values (nid, a_id, mark || ' note edited')
          on conflict (id) do update set title = excluded.title;
        select count(*) into cnt from public.notes where id = nid and title = mark || ' note edited';
        res := res || ('31. A saves a note, then saves a change to it | ' || case when cnt = 1 then '✓ PASS' else '✗ FAIL: the change was not saved' end);
      exception when others then res := res || ('31. A saves a note, then saves a change to it | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.categories(user_id, name, color, icon) values (a_id, mark, '#000000', '📁')
          on conflict (user_id, name) do update set color = excluded.color;
        insert into public.categories(user_id, name, color, icon) values (a_id, mark, '#ffffff', '📁')
          on conflict (user_id, name) do update set color = excluded.color;
        select count(*) into cnt from public.categories where user_id = a_id and name = mark;
        res := res || ('32. A saves a list twice by name — still one list | ' || case when cnt = 1 then '✓ PASS' else ('✗ FAIL: ' || cnt || ' copies') end);
      exception when others then res := res || ('32. A saves a list twice by name — still one list | ✗ FAIL: ' || sqlerrm); end;

      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims',
        json_build_object('sub', '00000000-0000-0000-0000-0000000000ff', 'email', 'stranger@example.com')::text, true);
      execute 'set local role authenticated';
      select count(*) into cnt from public.notes where id = nid;
      res := res || ('33. A stranger CANNOT read A''s notes | ' || case when cnt = 0 then '✓ PASS' else '✗ FAIL: leaked' end);

      ------------------------------------------------------ attacks that must fail
      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims', json_build_object('sub', b_id::text, 'email', b_mail)::text, true);
      execute 'set local role authenticated';

      begin
        update public.folder_shares set can_edit = true, can_delete = true
          where owner_id = a_id and folder = mark || ' ro' and lower(shared_with_email) = b_mail;
        get diagnostics cnt = row_count;
        res := res || ('34. B CANNOT upgrade their own view-only share | ' || case when cnt = 0 then '✓ PASS' else '✗ FAIL: B made it editable' end);
      exception when others then res := res || ('34. B CANNOT upgrade their own view-only share | ✓ PASS')::text; end;

      begin
        insert into public.folder_shares(owner_id, folder, shared_with_email, can_delete)
        values (a_id, mark, 'nobody@example.com', true);
        res := res || ('35. B CANNOT pass A''s list on to someone else | ✗ FAIL: B shared it')::text;
      exception when others then res := res || ('35. B CANNOT pass A''s list on to someone else | ✓ PASS')::text; end;

      begin
        update public.messages set body = 'rewritten by B' where body = mark || ' direct hello' and recipient_email = b_mail;
        get diagnostics cnt = row_count;
        res := res || ('36. B CANNOT rewrite a message A sent them | ' || case when cnt = 0 then '✓ PASS' else '✗ FAIL: the text was changed' end);
      exception when others then res := res || ('36. B CANNOT rewrite a message A sent them | ✓ PASS')::text; end;

      begin
        update public.messages set read = true where body = mark || ' direct hello' and recipient_email = b_mail;
        get diagnostics cnt = row_count;
        res := res || ('37. B CAN still mark that message read | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: blocked' end);
      exception when others then res := res || ('37. B CAN still mark that message read | ✗ FAIL: ' || sqlerrm); end;

      begin
        update public.tasks set user_id = b_id where title = mark || ' open job';
        get diagnostics cnt = row_count;
        res := res || ('38. B CANNOT take ownership of a task assigned to them | ' || case when cnt = 0 then '✓ PASS' else '✗ FAIL: B owns it now' end);
      exception when others then res := res || ('38. B CANNOT take ownership of a task assigned to them | ✓ PASS')::text; end;

      select count(*) into cnt from public.profiles where id = a_id;
      res := res || ('39. B CAN see A''s profile (they share a list) | ' || case when cnt > 0 then '✓ PASS' else '✗ FAIL: hidden' end);

      execute 'set local role ' || quote_ident(orig);
      perform set_config('request.jwt.claims',
        json_build_object('sub', '00000000-0000-0000-0000-0000000000ee', 'email', 'nobody@example.com')::text, true);
      execute 'set local role authenticated';
      select count(*) into cnt from public.profiles where id in (a_id, b_id);
      res := res || ('40. A stranger CANNOT look up A''s or B''s email | ' || case when cnt = 0 then '✓ PASS' else ('✗ FAIL: ' || cnt || ' visible') end);
    end if;
  end if;

  ------------------------------------------------------------------- clean up
  execute 'set local role ' || quote_ident(orig);
  delete from public.tasks    where title like mark || '%';
  delete from public.folder_shares where folder like mark || '%';
  delete from public.messages where body like mark || '%' or body = 'rewritten by B';
  delete from public.notes where title like mark || '%';
  delete from public.categories where name like mark || '%';
  if made_req then
    delete from public.chat_requests where from_email = a_mail and to_email = b_mail;
  end if;
  if gid is not null then
    delete from public.group_members where group_id = gid;
    delete from public.groups where id = gid;
  end if;

  insert into _fr(step, result)
  select split_part(x, ' | ', 1), split_part(x, ' | ', 2) from unnest(res) x;
end $$;

select step as "Check", result as "Result" from _fr order by n;
