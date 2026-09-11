-- ═══════════════════════════════════════════════════════════════════════════
--  Freely · collaboration self-test
--  Paste into Supabase → SQL Editor → Run, then send me the result table.
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
      res := res || '1. A creates a team | ✓ PASS';
    exception when others then res := res || ('1. A creates a team | ✗ FAIL: ' || sqlerrm); end;

    if gid is not null then
      begin
        insert into public.group_members(group_id, email, added_by) values (gid, a_mail, a_mail);
        res := res || '2. A joins the team they made | ✓ PASS';
      exception when others then res := res || ('2. A joins the team they made | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.group_members(group_id, email, added_by) values (gid, b_mail, a_mail);
        res := res || '3. A pulls B into the team | ✓ PASS';
      exception when others then res := res || ('3. A pulls B into the team | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.messages(sender_id, sender_email, recipient_email, group_id, body)
        values (a_id, a_mail, null, gid, mark || ' team hello');
        res := res || '4. A posts in the team chat | ✓ PASS';
      exception when others then res := res || ('4. A posts in the team chat | ✗ FAIL: ' || sqlerrm); end;

      begin
        insert into public.messages(sender_id, sender_email, recipient_email, body)
        values (a_id, a_mail, b_mail, mark || ' direct hello');
        res := res || '5. A sends B a direct message | ✓ PASS';
      exception when others then res := res || ('5. A sends B a direct message | ✗ FAIL: ' || sqlerrm); end;

      -- only file a request if there is no real one already, so nothing of yours is disturbed
      begin
        insert into public.chat_requests(from_email, to_email, status) values (a_mail, b_mail, 'pending');
        made_req := true;
        res := res || '6. A files a friend request | ✓ PASS';
      exception
        when unique_violation then res := res || '6. A files a friend request | — skipped (a real request already exists)';
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
        res := res || '8. B replies in the team chat | ✓ PASS';
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
        res := res || '11. B replies directly to A | ✓ PASS';
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
        res := res || '15. A invites a guest (assign-only) | ✓ PASS';
      exception when others then res := res || ('15. A invites a guest (assign-only) | ✗ FAIL: ' || sqlerrm); end;

      -- a task in a list that was never shared, handed to B
      begin
        insert into public.tasks(id, user_id, title, tag, assigned_to)
        values (gen_random_uuid(), a_id, mark || ' open job', mark, b_mail);
        insert into public.tasks(id, user_id, title, tag, assigned_to, assign_private)
        values (gen_random_uuid(), a_id, mark || ' private job', mark, b_mail, true);
        res := res || '16. A assigns B work in an unshared list | ✓ PASS';
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
    end if;
  end if;

  ------------------------------------------------------------------- clean up
  execute 'set local role ' || quote_ident(orig);
  delete from public.tasks    where title like mark || '%';
  delete from public.messages where body like mark || '%';
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
