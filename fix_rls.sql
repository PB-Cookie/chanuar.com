-- Allow users to update their own submissions (needed for re-submission)
create policy "Users can update their own submission."
  on submissions for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Ensure the policy exists (idempotent check not easily possible in pure SQL without PL/pgSQL block, 
-- but running the above is safe if the policy doesn't exist. If it does, it will error, which is fine)
