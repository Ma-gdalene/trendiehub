import { Router, type IRouter } from "express";
import {
  AwardPointsBody,
  AwardPointsResponse,
  CreateAnnouncementBody,
  CreateAnnouncementResponse,
  CreateConversationBody,
  CreateConversationResponse,
  CreateSupportRequestBody,
  CreateSupportRequestResponse,
  CreateTaskBody,
  CreateTaskResponse,
  DecideApplicationBody,
  DecideApplicationParams,
  DecideApplicationResponse,
  GetAdminStatsResponse,
  GetDashboardResponse,
  GetLeaderboardResponse,
  GetProfileResponse,
  ListAnnouncementsResponse,
  ListApplicationsQueryParams,
  ListApplicationsResponse,
  ListAgencyAdminsResponse,
  ListAuditLogsResponse,
  ListConversationsResponse,
  ListDailyEntriesResponse,
  ListMessagesParams,
  ListMessagesResponse,
  ListModelsQueryParams,
  ListModelsResponse,
  ListNotificationsResponse,
  ListPointsResponse,
  ListSupportRequestsResponse,
  ListTasksQueryParams,
  ListTasksResponse,
  MarkAnnouncementReadParams,
  MarkNotificationsReadBody,
  ReplyToSupportRequestBody,
  ReplyToSupportRequestParams,
  ReplyToSupportRequestResponse,
  ReviewSubmissionBody,
  ReviewSubmissionParams,
  ReviewSubmissionResponse,
  SaveDailyEntryBody,
  SaveDailyEntryResponse,
  SetModelSuspensionBody,
  SetModelSuspensionParams,
  SetModelSuspensionResponse,
  SendMessageBody,
  SendMessageParams,
  SendMessageResponse,
  SubmitApplicationBody,
  SubmitApplicationResponse,
  SubmitTaskBody,
  SubmitTaskParams,
  SubmitTaskResponse,
  UpdateAnnouncementBody,
  UpdateAnnouncementParams,
  UpdateAnnouncementResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  UpdateModelProfileBody,
  UpdateModelProfileParams,
  UpdateModelProfileResponse,
  UpdateSupportRequestBody,
  UpdateSupportRequestParams,
  UpdateSupportRequestResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
} from "@workspace/api-zod";
import type { Request, Response } from "express";
import {
  firstRow,
  getAgencyContext,
  requireAdmin,
  safe,
  unwrap,
  type AgencyContext,
} from "../lib/supabase-context";

const router: IRouter = Router();
type Row = Record<string, any>;

function parseProfile(row: Row, emailFallback = ""): Row {
  const completeFields = [
    row.full_name,
    row.phone,
    row.date_of_birth,
    row.location,
    row.height_cm,
    row.biography,
    row.profile_photo_path,
    Array.isArray(row.interests) && row.interests.length,
  ].filter(Boolean).length;
  return {
    id: row.id,
    email: row.email ?? emailFallback,
    role: row.role === "admin" ? "admin" : "model",
    full_name: row.full_name ?? "",
    phone: row.phone ?? null,
    date_of_birth: row.date_of_birth ?? null,
    location: row.location ?? null,
    height_cm: row.height_cm === null || row.height_cm === undefined ? null : Number(row.height_cm),
    measurements: row.measurements ?? {},
    experience: row.experience ?? null,
    interests: row.interests ?? [],
    biography: row.biography ?? null,
    profile_photo_path: row.profile_photo_path ?? null,
    portfolio_paths: row.portfolio_paths ?? [],
    social_links: row.social_links ?? {},
    application_status: row.application_status ?? "not_submitted",
    review_reason: row.review_reason ?? null,
    points: row.points_balance ?? row.points ?? 0,
    profile_completion: Math.round((completeFields / 8) * 100),
    suspended_at: row.suspended_at ?? null,
    created_at: row.created_at,
  };
}

function parseApplication(row: Row): Row {
  const applicant = firstRow(row.applicant ?? row.profiles ?? null);
  return {
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    statement: row.statement ?? null,
    review_reason: row.review_reason ?? null,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at ?? null,
    ...(applicant ? { applicant: parseProfile(applicant) } : {}),
  };
}

function parseTask(row: Row, assignment?: Row): Row {
  const task = row.task ?? row;
  const assignmentRow = assignment ?? (row.task_assignments?.[0] as Row | undefined);
  const submission = firstRow(assignmentRow?.submission ?? assignmentRow?.task_submissions ?? null);
  const assignmentRows = row.task_assignments ?? (assignmentRow ? [assignmentRow] : []);
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    instructions: task.instructions ?? null,
    deadline: task.deadline ?? null,
    priority: task.priority ?? "normal",
    status: assignmentRow?.status ?? task.status ?? "open",
    created_at: task.created_at,
    assignment_id: assignmentRow?.id ?? null,
    assignment_status: assignmentRow?.status ?? null,
    submission: submission
      ? {
          id: submission.id,
          assignment_id: submission.assignment_id,
          notes: submission.notes ?? null,
          evidence_paths: submission.evidence_paths ?? [],
          status: submission.status,
          review_note: submission.review_note ?? null,
          points_awarded: submission.points_awarded ?? 0,
          submitted_at: submission.submitted_at,
        }
      : null,
    assignees: assignmentRows.map((item: Row) => ({
      id: item.model_id,
      full_name: item.assignee?.full_name ?? item.profiles?.full_name ?? "",
      email: item.assignee?.email ?? item.profiles?.email ?? "",
      assignment_id: item.id,
      status: item.status,
    })),
  };
}

function parseAnnouncement(row: Row, userId: string): Row {
  const reads: Row[] = row.announcement_reads ?? [];
  const recipients: Row[] = row.announcement_recipients ?? [];
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    audience: row.audience,
    recipient_ids: recipients.map((recipient) => recipient.user_id),
    published_at: row.published_at ?? null,
    is_read: reads.some((read) => read.user_id === userId),
    created_at: row.created_at,
  };
}

function parseNotification(row: Row): Row {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body ?? null,
    link: row.link ?? null,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

function parseSupportRequest(row: Row): Row {
  return {
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    replies: (row.replies ?? row.support_replies ?? []).map((reply: Row) => ({
      id: reply.id,
      request_id: reply.request_id,
      author_id: reply.author_id,
      body: reply.body,
      created_at: reply.created_at,
    })),
  };
}

async function currentProfile(ctx: AgencyContext): Promise<Row> {
  const result = await ctx.client.from("profiles").select("*").eq("id", ctx.user.id).single();
  return unwrap(result) as Row;
}

async function taskRows(ctx: AgencyContext): Promise<Row[]> {
  if (ctx.profile.role === "admin") {
    const result = await ctx.client
      .from("tasks")
      .select("*,task_assignments(id,model_id,status,task_submissions(*),assignee:profiles!task_assignments_model_id_fkey(id,full_name,email))")
      .order("created_at", { ascending: false });
    return (unwrap(result) as Row[]).flatMap((row) => {
      const assignments = (row.task_assignments ?? []) as Row[];
      return assignments.length
        ? assignments.map((assignment) => parseTask(row, assignment))
        : [parseTask(row)];
    });
  }
  const result = await ctx.client
    .from("task_assignments")
    .select("id,status,model_id,task:tasks(*),submission:task_submissions(*)")
    .eq("model_id", ctx.user.id)
    .order("assigned_at", { ascending: false });
  return (unwrap(result) as Row[]).map((row) => parseTask(row, row));
}

async function announcementRows(ctx: AgencyContext): Promise<Row[]> {
  const result = await ctx.client
    .from("announcements")
    .select("*,announcement_recipients(user_id),announcement_reads(user_id)")
    .order("created_at", { ascending: false });
  return (unwrap(result) as Row[]).map((row) => parseAnnouncement(row, ctx.user.id));
}

function parseBody<T>(
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { message: string } } },
  body: unknown,
  res: Response,
): T | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return null;
  }
  return parsed.data;
}

function parseParams<T>(
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { message: string } } },
  params: unknown,
  res: Response,
): T | null {
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return null;
  }
  return parsed.data;
}

function isOwnStoragePath(userId: string, path: string): boolean {
  return path.length > 0 && !path.startsWith("/") && path.split("/")[0] === userId;
}

function storagePathsBelongToUser(
  ctx: AgencyContext,
  profilePhotoPath: string | null | undefined,
  portfolioPaths: string[] | undefined,
  evidencePaths?: string[],
): boolean {
  return (
    (!profilePhotoPath || isOwnStoragePath(ctx.user.id, profilePhotoPath)) &&
    (portfolioPaths ?? []).every((path) => isOwnStoragePath(ctx.user.id, path)) &&
    (evidencePaths ?? []).every((path) => isOwnStoragePath(ctx.user.id, path))
  );
}

router.get(
  "/me",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const data = parseProfile(await currentProfile(ctx), ctx.user.email ?? "");
    res.json(GetProfileResponse.parse(data));
  }),
);

router.patch(
  "/me",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const body = parseBody(UpdateProfileBody, req.body, res);
    if (!body) return;
    if (!storagePathsBelongToUser(ctx, body.profile_photo_path, body.portfolio_paths)) {
      res.status(400).json({ error: "Uploaded file paths must belong to your account." });
      return;
    }
    if (Object.keys(body).length === 0) {
      res.status(400).json({ error: "Provide at least one profile field to update." });
      return;
    }
    const result = await ctx.client.from("profiles").update(body).eq("id", ctx.user.id).select("*").single();
    const data = parseProfile(unwrap(result) as Row, ctx.user.email ?? "");
    res.json(UpdateProfileResponse.parse(data));
  }),
);

router.get(
  "/dashboard",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const profile = parseProfile(await currentProfile(ctx), ctx.user.email ?? "");
    const [tasks, announcements] = await Promise.all([taskRows(ctx), announcementRows(ctx)]);
    const [{ count: unreadNotifications, error: notificationError }, conversationResult, auditResult] =
      await Promise.all([
        ctx.client.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
        ctx.client
          .from("conversations")
          .select("id,conversation_participants(user_id,last_read_at)")
          .order("updated_at", { ascending: false }),
        ctx.profile.role === "admin"
          ? ctx.client.from("audit_events").select("id,action,entity_type,entity_id,created_at").order("created_at", { ascending: false }).limit(6)
          : ctx.client.from("notifications").select("id,kind,title,created_at").order("created_at", { ascending: false }).limit(6),
      ]);
    if (notificationError) throw notificationError;
    const conversations = unwrap(conversationResult) as Row[];
    const latestMessagesResult = await ctx.client
      .from("messages")
      .select("conversation_id,sender_id,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    const latestMessages = (unwrap(latestMessagesResult) as Row[]);
    let unreadMessages = 0;
    for (const conversation of conversations) {
      const participant = (conversation.conversation_participants as Row[]).find(
        (item) => item.user_id === ctx.user.id,
      );
      if (!participant) continue;
      const readAt = participant.last_read_at ? new Date(participant.last_read_at).getTime() : 0;
      unreadMessages += latestMessages.filter(
        (message) =>
          message.conversation_id === conversation.id &&
          message.sender_id !== ctx.user.id &&
          new Date(message.created_at).getTime() > readAt,
      ).length;
    }

    let stats: Row;
    if (ctx.profile.role === "admin") {
      stats = await adminStats(ctx);
    } else {
      stats = {
        total_models: 0,
        pending_applications: 0,
        approved_models: 0,
        tasks: tasks.length,
        completed_tasks: tasks.filter((task) => task.assignment_status === "completed").length,
        messages: latestMessages.filter((message) => message.sender_id !== ctx.user.id).length,
        support_requests: 0,
      };
    }

    let leaderboardPosition: number | null = null;
    if (ctx.profile.role === "model" && profile.application_status === "approved") {
      const leaderboardResult = await ctx.client.rpc("get_leaderboard");
      const leaderboard = (unwrap(leaderboardResult) as Row[]);
      leaderboardPosition = leaderboard.find((entry) => entry.user_id === ctx.user.id)?.rank ?? null;
    }
    if (auditResult.error) throw auditResult.error;
    const activity = ((auditResult.data ?? []) as Row[]).map((entry) => ({
      id: entry.id,
      kind: entry.kind ?? entry.action,
      title: entry.title ?? `${entry.action} ${entry.entity_type}`,
      created_at: entry.created_at,
    }));
    const data = {
      profile,
      ...stats,
      support_requests: ctx.profile.role === "admin" ? stats.support_requests : 0,
      leaderboard_position: leaderboardPosition,
      upcoming_tasks: tasks
        .filter((task) => !["completed", "cancelled"].includes(task.status))
        .sort((left, right) => (left.deadline ?? "9999").localeCompare(right.deadline ?? "9999"))
        .slice(0, 5),
      announcements: announcements.slice(0, 5),
      unread_messages: unreadMessages,
      unread_notifications: unreadNotifications ?? 0,
      recent_activity: activity,
    };
    res.json(GetDashboardResponse.parse(data));
  }),
);

router.get(
  "/models",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const parsed = ListModelsQueryParams.safeParse({
      search: req.query.search,
      status: req.query.status,
    });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    let query = ctx.client.from("profiles").select("*").eq("role", "model").order("created_at", { ascending: false });
    if (parsed.data.search) query = query.ilike("full_name", `%${parsed.data.search}%`);
    if (parsed.data.status && parsed.data.status !== "all") {
      if (parsed.data.status === "suspended") query = query.not("suspended_at", "is", null);
      else query = query.eq("application_status", parsed.data.status);
    }
    const data = unwrap(await query);
    res.json(ListModelsResponse.parse((data as Row[]).map((row) => parseProfile(row))));
  }),
);

router.patch(
  "/models/:id",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(UpdateModelProfileParams, req.params, res);
    const body = parseBody(UpdateModelProfileBody, req.body, res);
    if (!params || !body) return;
    const pathsBelongToModel =
      (!body.profile_photo_path || isOwnStoragePath(params.id, body.profile_photo_path)) &&
      (body.portfolio_paths ?? []).every((path) => isOwnStoragePath(params.id, path));
    if (!pathsBelongToModel) {
      res.status(400).json({ error: "Model media paths must remain inside that model's storage folder." });
      return;
    }
    const result = await ctx.client
      .from("profiles")
      .update(body)
      .eq("id", params.id)
      .eq("role", "model")
      .select("*")
      .single();
    res.json(UpdateModelProfileResponse.parse(parseProfile(unwrap(result) as Row)));
  }),
);

router.post(
  "/models/:id/suspension",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(SetModelSuspensionParams, req.params, res);
    const body = parseBody(SetModelSuspensionBody, req.body, res);
    if (!params || !body) return;
    const result = await ctx.client.rpc("admin_set_model_suspension", {
      p_model_id: params.id,
      p_suspended: body.suspended,
    });
    res.json(SetModelSuspensionResponse.parse(parseProfile(firstRow(unwrap(result) as Row | Row[]) as Row)));
  }),
);

router.get(
  "/agency-admins",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const result = await ctx.client.rpc("get_agency_admins");
    res.json(ListAgencyAdminsResponse.parse(unwrap(result)));
  }),
);

router.get(
  "/applications",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const parsed = ListApplicationsQueryParams.safeParse({ status: req.query.status });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    let query = ctx.client
      .from("applications")
      .select("*,applicant:profiles!applications_user_id_fkey(*)")
      .order("submitted_at", { ascending: false });
    if (ctx.profile.role !== "admin") query = query.eq("user_id", ctx.user.id);
    if (parsed.data.status && parsed.data.status !== "all") query = query.eq("status", parsed.data.status);
    const data = unwrap(await query) as Row[];
    res.json(ListApplicationsResponse.parse(data.map(parseApplication)));
  }),
);

router.post(
  "/applications",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const body = parseBody(SubmitApplicationBody, req.body, res);
    if (!body) return;

    let appRow: Row | null = null;
    const result = await ctx.client.rpc("submit_application", { p_statement: body.statement ?? null });
    if (!result.error && result.data) {
      appRow = firstRow(result.data as Row | Row[]);
    } else {
      // Fallback: direct insert using adminClient or client
      const db = ctx.adminClient ?? ctx.client;
      const insertRes = await db
        .from("applications")
        .insert({
          user_id: ctx.user.id,
          statement: body.statement ?? null,
          status: "pending",
        })
        .select()
        .single();
      if (insertRes.error) {
        throw insertRes.error;
      }
      appRow = insertRes.data as Row;

      if (ctx.adminClient) {
        try {
          await ctx.adminClient
            .from("profiles")
            .update({ application_status: "pending", review_reason: null })
            .eq("id", ctx.user.id);
        } catch {
          // If trigger blocks direct profile status update, application record is still submitted and visible to admin
        }
      }
    }

    if (!appRow) {
      res.status(500).json({ error: "Failed to submit application." });
      return;
    }

    const profile = await currentProfile(ctx);
    const data = parseApplication({ ...appRow, applicant: profile });
    res.status(201).json(SubmitApplicationResponse.parse(data));
  }),
);

router.post(
  "/applications/:id/decision",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(DecideApplicationParams, req.params, res);
    const body = parseBody(DecideApplicationBody, req.body, res);
    if (!params || !body) return;

    let appRow: Row | null = null;
    const result = await ctx.client.rpc("admin_decide_application", {
      p_id: params.id,
      p_status: body.status,
      p_reason: body.reason,
    });
    if (!result.error && result.data) {
      appRow = firstRow(result.data as Row | Row[]);
    } else {
      const db = ctx.adminClient ?? ctx.client;
      const appUpdate = await db
        .from("applications")
        .update({
          status: body.status,
          review_reason: body.reason,
          reviewer_id: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();
      if (appUpdate.error) throw appUpdate.error;
      appRow = appUpdate.data as Row;

      if (ctx.adminClient) {
        try {
          await ctx.adminClient
            .from("profiles")
            .update({
              application_status: body.status,
              review_reason: body.reason,
            })
            .eq("id", appRow.user_id);
        } catch {}
      }
    }

    if (!appRow) {
      res.status(500).json({ error: "Failed to record application decision." });
      return;
    }

    const applicantResult = await ctx.client.from("profiles").select("*").eq("id", appRow.user_id).maybeSingle();
    const applicant = applicantResult.data ?? null;
    res.json(DecideApplicationResponse.parse(parseApplication({ ...appRow, applicant })));
  }),
);

router.get(
  "/tasks",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const parsed = ListTasksQueryParams.safeParse({ status: req.query.status });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const tasks = await taskRows(ctx);
    const filtered = parsed.data.status && parsed.data.status !== "all"
      ? tasks.filter((task) => task.status === parsed.data.status)
      : tasks;
    res.json(ListTasksResponse.parse(filtered));
  }),
);

router.post(
  "/tasks",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const body = parseBody(CreateTaskBody, req.body, res);
    if (!body) return;
    const result = await ctx.client.rpc("admin_create_task", {
      p_title: body.title,
      p_description: body.description,
      p_instructions: body.instructions ?? null,
      p_deadline: body.deadline ?? null,
      p_priority: body.priority,
      p_assignment_user_ids: body.assignment_user_ids,
    });
    const data = firstRow(unwrap(result) as Row | Row[]);
    res.status(201).json(CreateTaskResponse.parse(parseTask(data as Row)));
  }),
);

router.patch(
  "/tasks/:id",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(UpdateTaskParams, req.params, res);
    const body = parseBody(UpdateTaskBody, req.body, res);
    if (!params || !body) return;
    const { assignment_user_ids: assignmentIds, ...patch } = body;
    const result = await ctx.client.rpc("admin_update_task", {
      p_id: params.id,
      p_patch: patch,
      p_assignment_user_ids: assignmentIds ?? null,
    });
    res.json(UpdateTaskResponse.parse(parseTask(firstRow(unwrap(result) as Row | Row[]) as Row)));
  }),
);

router.delete(
  "/tasks/:id",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Task id is required." });
      return;
    }
    const db = ctx.adminClient ?? ctx.client;
    const result = await db.from("tasks").delete().eq("id", id);
    if (result.error) throw result.error;
    res.status(200).json({ success: true, id });
  }),
);

router.post(
  "/tasks/:id/submissions",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    if (ctx.profile.role !== "model") {
      res.status(403).json({ error: "Only model accounts can submit task work." });
      return;
    }
    const params = parseParams(SubmitTaskParams, req.params, res);
    const body = parseBody(SubmitTaskBody, req.body, res);
    if (!params || !body) return;
    if (!storagePathsBelongToUser(ctx, null, undefined, body.evidence_paths)) {
      res.status(400).json({ error: "Evidence files must belong to your account." });
      return;
    }
    const result = await ctx.client.rpc("submit_task", {
      p_task_id: params.id,
      p_notes: body.notes ?? null,
      p_evidence_paths: body.evidence_paths,
    });
    res.status(201).json(SubmitTaskResponse.parse(firstRow(unwrap(result) as Row | Row[])));
  }),
);

router.post(
  "/submissions/:id/review",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(ReviewSubmissionParams, req.params, res);
    const body = parseBody(ReviewSubmissionBody, req.body, res);
    if (!params || !body) return;
    const result = await ctx.client.rpc("admin_review_submission", {
      p_id: params.id,
      p_status: body.status,
      p_review_note: body.review_note,
      p_points_awarded: body.points_awarded,
    });
    res.json(ReviewSubmissionResponse.parse(firstRow(unwrap(result) as Row | Row[])));
  }),
);

router.get(
  "/leaderboard",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const result = await ctx.client.rpc("get_leaderboard");
    res.json(GetLeaderboardResponse.parse(unwrap(result)));
  }),
);

router.get(
  "/points",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const result = await ctx.client.from("points_transactions").select("*").order("created_at", { ascending: false }).limit(250);
    const data = (unwrap(result) as Row[]).map((row) => ({
      id: row.id,
      model_id: row.model_id,
      delta: row.delta,
      reason: row.reason,
      created_at: row.created_at,
    }));
    res.json(ListPointsResponse.parse(data));
  }),
);

router.post(
  "/points",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const body = parseBody(AwardPointsBody, req.body, res);
    if (!body) return;
    if (body.delta === 0) {
      res.status(400).json({ error: "Point adjustments must be non-zero." });
      return;
    }
    const result = await ctx.client.rpc("admin_award_points", {
      p_model_id: body.model_id,
      p_delta: body.delta,
      p_reason: body.reason,
    });
    res.status(201).json(AwardPointsResponse.parse(firstRow(unwrap(result) as Row | Row[])));
  }),
);

router.get(
  "/announcements",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    res.json(ListAnnouncementsResponse.parse(await announcementRows(ctx)));
  }),
);

router.post(
  "/announcements",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const body = parseBody(CreateAnnouncementBody, req.body, res);
    if (!body) return;
    const result = await ctx.client.rpc("admin_save_announcement", {
      p_id: null,
      p_title: body.title,
      p_body: body.body,
      p_status: body.status,
      p_audience: body.audience,
      p_recipient_ids: body.recipient_ids,
    });
    const data = firstRow(unwrap(result) as Row | Row[]);
    res.status(201).json(CreateAnnouncementResponse.parse(parseAnnouncement(data as Row, ctx.user.id)));
  }),
);

router.patch(
  "/announcements/:id",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(UpdateAnnouncementParams, req.params, res);
    const body = parseBody(UpdateAnnouncementBody, req.body, res);
    if (!params || !body) return;
    const current = await ctx.client
      .from("announcements")
      .select("title,body,status,audience,announcement_recipients(user_id)")
      .eq("id", params.id)
      .single();
    const existing = unwrap(current) as Row;
    const result = await ctx.client.rpc("admin_save_announcement", {
      p_id: params.id,
      p_title: body.title ?? existing.title,
      p_body: body.body ?? existing.body,
      p_status: body.status ?? existing.status,
      p_audience: body.audience ?? existing.audience,
      p_recipient_ids: body.recipient_ids ?? ((existing.announcement_recipients ?? []) as Row[]).map((recipient) => recipient.user_id),
    });
    const data = firstRow(unwrap(result) as Row | Row[]);
    res.json(UpdateAnnouncementResponse.parse(parseAnnouncement(data as Row, ctx.user.id)));
  }),
);

router.delete(
  "/announcements/:id",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Announcement id is required." });
      return;
    }
    const db = ctx.adminClient ?? ctx.client;
    const result = await db.from("announcements").delete().eq("id", id);
    if (result.error) throw result.error;
    res.status(200).json({ success: true, id });
  }),
);

router.post(
  "/announcements/:id/read",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const params = parseParams(MarkAnnouncementReadParams, req.params, res);
    if (!params) return;
    const result = await ctx.client.from("announcement_reads").upsert(
      { announcement_id: params.id, user_id: ctx.user.id },
      { onConflict: "announcement_id,user_id", ignoreDuplicates: true },
    );
    if (result.error) throw result.error;
    res.sendStatus(204);
  }),
);

router.get(
  "/conversations",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const conversationResult = await ctx.client
      .from("conversations")
      .select("id,title,created_at,updated_at,conversation_participants(user_id,last_read_at)")
      .order("updated_at", { ascending: false });
    const conversations = unwrap(conversationResult) as Row[];
    const messageResult = await ctx.client
      .from("messages")
      .select("conversation_id,sender_id,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    const messages = unwrap(messageResult) as Row[];
    const data = conversations.map((conversation) => {
      const participants: Row[] = conversation.conversation_participants ?? [];
      const own = participants.find((participant) => participant.user_id === ctx.user.id);
      const readAt = own?.last_read_at ? new Date(own.last_read_at).getTime() : 0;
      const relevantMessages = messages.filter((message) => message.conversation_id === conversation.id);
      return {
        id: conversation.id,
        title: conversation.title ?? null,
        participants: participants.map((participant) => participant.user_id),
        last_message_at: relevantMessages[0]?.created_at ?? conversation.updated_at ?? null,
        unread_count: relevantMessages.filter(
          (message) => message.sender_id !== ctx.user.id && new Date(message.created_at).getTime() > readAt,
        ).length,
        created_at: conversation.created_at,
      };
    });
    res.json(ListConversationsResponse.parse(data));
  }),
);

router.post(
  "/conversations",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const body = parseBody(CreateConversationBody, req.body, res);
    if (!body) return;
    const result = await ctx.client.rpc("start_conversation", {
      p_recipient_id: body.recipient_id,
      p_title: body.title ?? null,
      p_initial_message: body.initial_message,
    });
    const data = firstRow(unwrap(result) as Row | Row[]);
    res.status(201).json(CreateConversationResponse.parse({
      ...data as Row,
      participants: [ctx.user.id, body.recipient_id],
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    }));
  }),
);

router.get(
  "/conversations/:id/messages",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const params = parseParams(ListMessagesParams, req.params, res);
    if (!params) return;
    const result = await ctx.client
      .from("messages")
      .select("*")
      .eq("conversation_id", params.id)
      .order("created_at", { ascending: true })
      .limit(1000);
    const data = unwrap(result) as Row[];
    const readResult = await ctx.client
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", params.id)
      .eq("user_id", ctx.user.id);
    if (readResult.error) throw readResult.error;
    res.json(ListMessagesResponse.parse(data));
  }),
);

router.post(
  "/conversations/:id/messages",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const params = parseParams(SendMessageParams, req.params, res);
    const body = parseBody(SendMessageBody, req.body, res);
    if (!params || !body) return;
    const result = await ctx.client
      .from("messages")
      .insert({ conversation_id: params.id, sender_id: ctx.user.id, body: body.body })
      .select("*")
      .single();
    res.status(201).json(SendMessageResponse.parse(unwrap(result)));
  }),
);

router.get(
  "/notifications",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const result = await ctx.client.from("notifications").select("*").order("created_at", { ascending: false }).limit(300);
    res.json(ListNotificationsResponse.parse((unwrap(result) as Row[]).map(parseNotification)));
  }),
);

router.post(
  "/notifications/read",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const body = parseBody(MarkNotificationsReadBody, req.body, res);
    if (!body) return;
    const result = await ctx.client.from("notifications").update({ is_read: true }).eq("user_id", ctx.user.id).in("id", body.ids);
    if (result.error) throw result.error;
    res.sendStatus(204);
  }),
);

router.get(
  "/tracker",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    if (ctx.profile.role !== "model") {
      res.status(403).json({ error: "Daily tracking is available to model accounts." });
      return;
    }
    const result = await ctx.client.from("daily_entries").select("*").eq("user_id", ctx.user.id).order("entry_date", { ascending: false }).limit(365);
    res.json(ListDailyEntriesResponse.parse(unwrap(result)));
  }),
);

router.post(
  "/tracker",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    if (ctx.profile.role !== "model") {
      res.status(403).json({ error: "Daily tracking is available to model accounts." });
      return;
    }
    const body = parseBody(SaveDailyEntryBody, req.body, res);
    if (!body) return;
    const result = await ctx.client
      .from("daily_entries")
      .upsert({ ...body, user_id: ctx.user.id }, { onConflict: "user_id,entry_date" })
      .select("*")
      .single();
    res.json(SaveDailyEntryResponse.parse(unwrap(result)));
  }),
);

router.get(
  "/support-requests",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const result = await ctx.client
      .from("support_requests")
      .select("*,replies:support_replies(*)")
      .order("updated_at", { ascending: false });
    res.json(ListSupportRequestsResponse.parse((unwrap(result) as Row[]).map(parseSupportRequest)));
  }),
);

router.post(
  "/support-requests",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const body = parseBody(CreateSupportRequestBody, req.body, res);
    if (!body) return;
    const result = await ctx.client.rpc("create_support_request", {
      p_subject: body.subject,
      p_message: body.message,
    });
    const data = firstRow(unwrap(result) as Row | Row[]);
    res.status(201).json(CreateSupportRequestResponse.parse(parseSupportRequest(data as Row)));
  }),
);

router.patch(
  "/support-requests/:id",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const params = parseParams(UpdateSupportRequestParams, req.params, res);
    const body = parseBody(UpdateSupportRequestBody, req.body, res);
    if (!params || !body) return;
    const result = await ctx.client
      .from("support_requests")
      .update({ status: body.status })
      .eq("id", params.id)
      .select("*,replies:support_replies(*)")
      .single();
    res.json(UpdateSupportRequestResponse.parse(parseSupportRequest(unwrap(result) as Row)));
  }),
);

router.post(
  "/support-requests/:id/replies",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx) return;
    const params = parseParams(ReplyToSupportRequestParams, req.params, res);
    const body = parseBody(ReplyToSupportRequestBody, req.body, res);
    if (!params || !body) return;
    const result = await ctx.client
      .from("support_replies")
      .insert({ request_id: params.id, author_id: ctx.user.id, body: body.body })
      .select("*")
      .single();
    res.status(201).json(ReplyToSupportRequestResponse.parse(unwrap(result)));
  }),
);

router.get(
  "/audit-logs",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    const result = await ctx.client
      .from("audit_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    res.json(ListAuditLogsResponse.parse(unwrap(result)));
  }),
);

async function adminStats(ctx: AgencyContext): Promise<Row> {
  if (ctx.profile.role !== "admin") {
    throw Object.assign(new Error("Admin access required"), { code: "42501" });
  }
  const [profilesResult, tasksResult, completedResult, messagesResult, supportResult, openSupportResult] = await Promise.all([
    ctx.client.from("profiles").select("id,role,application_status,suspended_at"),
    ctx.client.from("tasks").select("id", { count: "exact", head: true }),
    ctx.client.from("task_assignments").select("id", { count: "exact", head: true }).eq("status", "completed"),
    ctx.client.from("messages").select("id", { count: "exact", head: true }),
    ctx.client.from("support_requests").select("id", { count: "exact", head: true }),
    ctx.client.from("support_requests").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
  ]);
  const profiles = unwrap(profilesResult) as Row[];
  for (const result of [tasksResult, completedResult, messagesResult, supportResult, openSupportResult]) {
    if (result.error) throw result.error;
  }
  return {
    total_models: profiles.filter((row) => row.role === "model").length,
    pending_applications: profiles.filter((row) => row.role === "model" && row.application_status === "pending").length,
    approved_models: profiles.filter((row) => row.role === "model" && row.application_status === "approved" && !row.suspended_at).length,
    tasks: tasksResult.count ?? 0,
    completed_tasks: completedResult.count ?? 0,
    messages: messagesResult.count ?? 0,
    support_requests: supportResult.count ?? 0,
    open_support_requests: openSupportResult.count ?? 0,
  };
}

router.get(
  "/admin/stats",
  safe(async (req, res) => {
    const ctx = await getAgencyContext(req, res);
    if (!ctx || !requireAdmin(ctx, res)) return;
    res.json(GetAdminStatsResponse.parse(await adminStats(ctx)));
  }),
);

export default router;
