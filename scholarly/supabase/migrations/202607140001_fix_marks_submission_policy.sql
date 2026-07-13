drop policy if exists marks_update_teacher on public.marks;

create policy marks_update_teacher on public.marks for update using (
  teacher_id = auth.uid()
  and app.can_teacher_edit_exam(school_id, exam_id)
) with check (
  teacher_id = auth.uid()
  and app.can_teacher_edit_exam(school_id, exam_id)
  and status in ('draft', 'rejected', 'submitted')
);
