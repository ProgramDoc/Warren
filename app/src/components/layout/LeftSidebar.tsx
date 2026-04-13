"use client";

import { useState, useRef, useEffect } from "react";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  user_id: string;
  shared_with: string | null;
  project_id: string | null;
}

interface Project {
  id: string;
  name: string;
  position: number;
}

interface ShareUser {
  id: string;
  display_name: string;
  email: string;
}

interface LeftSidebarProps {
  conversations: Conversation[];
  projects: Project[];
  activeId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onShare: (id: string, shareWithUserId: string | null) => void;
  onNewChat: () => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onMoveConversation: (conversationId: string, projectId: string | null) => void;
}

export default function LeftSidebar({
  conversations,
  projects,
  activeId,
  currentUserId,
  onSelect,
  onDelete,
  onRename,
  onShare,
  onNewChat,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onMoveConversation,
}: LeftSidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [shareUsers, setShareUsers] = useState<ShareUser[]>([]);
  const [shareMenuId, setShareMenuId] = useState<string | null>(null);
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);

  // Project state
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("warren-collapsed-projects");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [projectMenuId, setProjectMenuId] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameProjectValue, setRenameProjectValue] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const projectRenameRef = useRef<HTMLInputElement>(null);
  const newProjectRef = useRef<HTMLInputElement>(null);

  // Load share-able users once
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setShareUsers(data.users);
      })
      .catch(() => {});
  }, []);

  // Focus rename input
  useEffect(() => {
    if (renamingId) renameRef.current?.focus();
  }, [renamingId]);

  useEffect(() => {
    if (renamingProjectId) projectRenameRef.current?.focus();
  }, [renamingProjectId]);

  useEffect(() => {
    if (creatingProject) newProjectRef.current?.focus();
  }, [creatingProject]);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem("warren-collapsed-projects", JSON.stringify([...collapsedProjects]));
  }, [collapsedProjects]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
        setShareMenuId(null);
        setMoveMenuId(null);
        setProjectMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function startRename(conv: Conversation) {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
    setMenuOpenId(null);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    } else if (e.key === "Escape") {
      setRenamingId(null);
    }
  }

  function startProjectRename(project: Project) {
    setRenamingProjectId(project.id);
    setRenameProjectValue(project.name);
    setProjectMenuId(null);
  }

  function commitProjectRename() {
    if (renamingProjectId && renameProjectValue.trim()) {
      onRenameProject(renamingProjectId, renameProjectValue.trim());
    }
    setRenamingProjectId(null);
  }

  function handleProjectRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitProjectRename();
    } else if (e.key === "Escape") {
      setRenamingProjectId(null);
    }
  }

  function commitNewProject() {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
    }
    setCreatingProject(false);
    setNewProjectName("");
  }

  function handleNewProjectKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitNewProject();
    } else if (e.key === "Escape") {
      setCreatingProject(false);
      setNewProjectName("");
    }
  }

  function toggleProject(projectId: string) {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  function closeAllMenus() {
    setMenuOpenId(null);
    setShareMenuId(null);
    setMoveMenuId(null);
    setProjectMenuId(null);
  }

  const ownedConversations = conversations.filter((c) => c.user_id === currentUserId);
  const sharedConversations = conversations.filter((c) => c.user_id !== currentUserId);
  const unfiledConversations = ownedConversations.filter((c) => !c.project_id);

  return (
    <aside
      className="hidden lg:flex flex-col h-full w-64 py-6 px-4 gap-2"
      style={{ background: "var(--surface-container-low)" }}
    >
      {/* Warren AI Badge */}
      <div className="mb-6 px-2">
        <h3
          className="text-xs font-bold uppercase tracking-widest opacity-60"
          style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}
        >
          Intelligence
        </h3>
        <div
          className="mt-4 flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "var(--surface-container)" }}
        >
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <div>
            <p className="text-xs font-bold leading-none" style={{ color: "var(--on-surface)" }}>
              Warren AI
            </p>
            <p className="text-[10px] mt-1" style={{ color: "var(--on-surface-variant)" }}>
              Financial Advisor
            </p>
          </div>
        </div>
      </div>

      {/* New Analysis Button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
        style={{
          background: "var(--surface-container)",
          color: "var(--primary)",
          fontFamily: "var(--font-display)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-container-high)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-container)")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Analysis
      </button>

      {/* Conversation & Project List */}
      <nav className="flex-1 overflow-y-auto mt-2 space-y-0.5">
        {conversations.length === 0 && projects.length === 0 && (
          <p className="text-xs text-center mt-8 px-4" style={{ color: "var(--on-surface-muted)" }}>
            Start a conversation with Warren about your finances.
          </p>
        )}

        {/* Unfiled Conversations */}
        {unfiledConversations.map((conv) => (
          <ConversationRow
            key={conv.id}
            conv={conv}
            isActive={activeId === conv.id}
            isOwner={true}
            isRenaming={renamingId === conv.id}
            renameValue={renameValue}
            menuOpenId={menuOpenId}
            shareMenuId={shareMenuId}
            moveMenuId={moveMenuId}
            shareUsers={shareUsers}
            projects={projects}
            menuRef={menuRef}
            renameRef={renameRef}
            onSelect={onSelect}
            onStartRename={startRename}
            onRenameChange={setRenameValue}
            onRenameKeyDown={handleRenameKeyDown}
            onRenameBlur={commitRename}
            onDelete={onDelete}
            onShare={onShare}
            onMoveConversation={(projectId) => {
              onMoveConversation(conv.id, projectId);
              closeAllMenus();
            }}
            onMenuToggle={(id) => {
              setMenuOpenId(menuOpenId === id ? null : id);
              setShareMenuId(null);
              setMoveMenuId(null);
            }}
            onShareMenuToggle={(id) => setShareMenuId(shareMenuId === id ? null : id)}
            onMoveMenuToggle={(id) => setMoveMenuId(moveMenuId === id ? null : id)}
          />
        ))}

        {/* New Project Button */}
        {!creatingProject ? (
          <button
            onClick={() => setCreatingProject(true)}
            className="flex items-center gap-2 px-4 py-2 mt-3 text-xs transition-colors rounded-lg w-full"
            style={{ color: "var(--on-surface-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            New Project
          </button>
        ) : (
          <div className="px-4 py-2 mt-3">
            <input
              ref={newProjectRef}
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleNewProjectKeyDown}
              onBlur={commitNewProject}
              placeholder="Project name..."
              className="w-full text-xs bg-transparent border-b focus:outline-none px-1 py-1"
              style={{
                color: "var(--on-surface)",
                borderColor: "var(--primary)",
                fontFamily: "var(--font-display)",
              }}
            />
          </div>
        )}

        {/* Project Sections */}
        {projects.map((project) => {
          const projectConversations = ownedConversations.filter(
            (c) => c.project_id === project.id
          );
          const isCollapsed = collapsedProjects.has(project.id);
          const isProjectMenuOpen = projectMenuId === project.id;

          return (
            <div key={project.id} className="mt-3">
              {/* Project Header */}
              <div className="relative group">
                <div
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition-colors"
                  onClick={() => toggleProject(project.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-container)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Chevron */}
                  <svg
                    className="w-3 h-3 shrink-0 transition-transform"
                    style={{
                      color: "var(--on-surface-muted)",
                      transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  {/* Folder icon */}
                  <svg
                    className="w-3.5 h-3.5 shrink-0 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--on-surface-muted)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>

                  {/* Name or rename input */}
                  {renamingProjectId === project.id ? (
                    <input
                      ref={projectRenameRef}
                      value={renameProjectValue}
                      onChange={(e) => setRenameProjectValue(e.target.value)}
                      onKeyDown={handleProjectRenameKeyDown}
                      onBlur={commitProjectRename}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs flex-1 bg-transparent border-b focus:outline-none font-bold uppercase tracking-widest"
                      style={{
                        color: "var(--on-surface)",
                        borderColor: "var(--primary)",
                        fontFamily: "var(--font-display)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest flex-1 truncate"
                      style={{
                        color: "var(--on-surface-muted)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {project.name}
                    </span>
                  )}

                  {/* Count badge */}
                  <span className="text-[10px] opacity-40" style={{ color: "var(--on-surface-muted)" }}>
                    {projectConversations.length}
                  </span>

                  {/* Three-dot menu */}
                  {renamingProjectId !== project.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectMenuId(isProjectMenuOpen ? null : project.id);
                        setMenuOpenId(null);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                      style={{ color: "var(--on-surface-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--on-surface)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Project Context Menu */}
                {isProjectMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-2 top-8 z-50 w-40 rounded-lg py-1.5 shadow-xl"
                    style={{
                      background: "var(--surface-container-highest)",
                      border: "1px solid rgba(183, 196, 255, 0.1)",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startProjectRename(project);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
                      style={{ color: "var(--on-surface-variant)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--surface-container-high)";
                        e.currentTarget.style.color = "var(--on-surface)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--on-surface-variant)";
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Rename
                    </button>
                    <div className="my-1 mx-3" style={{ borderTop: "1px solid rgba(183, 196, 255, 0.08)" }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                        setProjectMenuId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
                      style={{ color: "var(--accent-red)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 123, 123, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Project Conversations */}
              {!isCollapsed && (
                <div className="ml-3">
                  {projectConversations.length === 0 && (
                    <p
                      className="text-[10px] px-4 py-2 italic"
                      style={{ color: "var(--on-surface-muted)" }}
                    >
                      No conversations
                    </p>
                  )}
                  {projectConversations.map((conv) => (
                    <ConversationRow
                      key={conv.id}
                      conv={conv}
                      isActive={activeId === conv.id}
                      isOwner={true}
                      isRenaming={renamingId === conv.id}
                      renameValue={renameValue}
                      menuOpenId={menuOpenId}
                      shareMenuId={shareMenuId}
                      moveMenuId={moveMenuId}
                      shareUsers={shareUsers}
                      projects={projects}
                      menuRef={menuRef}
                      renameRef={renameRef}
                      onSelect={onSelect}
                      onStartRename={startRename}
                      onRenameChange={setRenameValue}
                      onRenameKeyDown={handleRenameKeyDown}
                      onRenameBlur={commitRename}
                      onDelete={onDelete}
                      onShare={onShare}
                      onMoveConversation={(projectId) => {
                        onMoveConversation(conv.id, projectId);
                        closeAllMenus();
                      }}
                      onMenuToggle={(id) => {
                        setMenuOpenId(menuOpenId === id ? null : id);
                        setShareMenuId(null);
                        setMoveMenuId(null);
                      }}
                      onShareMenuToggle={(id) => setShareMenuId(shareMenuId === id ? null : id)}
                      onMoveMenuToggle={(id) => setMoveMenuId(moveMenuId === id ? null : id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Shared With Me */}
        {sharedConversations.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-4">
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--on-surface-muted)" }}
              >
                Shared with me
              </p>
            </div>
            {sharedConversations.map((conv) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                isActive={activeId === conv.id}
                isOwner={false}
                isRenaming={false}
                renameValue=""
                menuOpenId={menuOpenId}
                shareMenuId={null}
                moveMenuId={null}
                shareUsers={[]}
                projects={[]}
                menuRef={menuRef}
                renameRef={renameRef}
                onSelect={onSelect}
                onStartRename={() => {}}
                onRenameChange={() => {}}
                onRenameKeyDown={() => {}}
                onRenameBlur={() => {}}
                onDelete={() => {}}
                onShare={() => {}}
                onMoveConversation={() => {}}
                onMenuToggle={() => {}}
                onShareMenuToggle={() => {}}
                onMoveMenuToggle={() => {}}
              />
            ))}
          </>
        )}
      </nav>

      {/* Bottom Links */}
      <div className="mt-auto space-y-1 pt-4">
        <a
          href="/overview"
          className="flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors rounded-lg"
          style={{ color: "var(--on-surface-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </a>
      </div>
    </aside>
  );
}

/* ─────────────── Conversation Row ─────────────── */

interface ConversationRowProps {
  conv: Conversation;
  isActive: boolean;
  isOwner: boolean;
  isRenaming: boolean;
  renameValue: string;
  menuOpenId: string | null;
  shareMenuId: string | null;
  moveMenuId: string | null;
  shareUsers: ShareUser[];
  projects: Project[];
  menuRef: React.RefObject<HTMLDivElement | null>;
  renameRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (id: string) => void;
  onStartRename: (conv: Conversation) => void;
  onRenameChange: (val: string) => void;
  onRenameKeyDown: (e: React.KeyboardEvent) => void;
  onRenameBlur: () => void;
  onDelete: (id: string) => void;
  onShare: (id: string, userId: string | null) => void;
  onMoveConversation: (projectId: string | null) => void;
  onMenuToggle: (id: string) => void;
  onShareMenuToggle: (id: string) => void;
  onMoveMenuToggle: (id: string) => void;
}

function ConversationRow({
  conv,
  isActive,
  isOwner,
  isRenaming,
  renameValue,
  menuOpenId,
  shareMenuId,
  moveMenuId,
  shareUsers,
  projects,
  menuRef,
  renameRef,
  onSelect,
  onStartRename,
  onRenameChange,
  onRenameKeyDown,
  onRenameBlur,
  onDelete,
  onShare,
  onMoveConversation,
  onMenuToggle,
  onShareMenuToggle,
  onMoveMenuToggle,
}: ConversationRowProps) {
  const isMenuOpen = menuOpenId === conv.id;

  return (
    <div className="relative group">
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all"
        style={{
          background: isActive ? "var(--surface-container)" : "transparent",
          color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
        }}
        onClick={() => !isRenaming && onSelect(conv.id)}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "var(--surface-container)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Chat icon */}
        <svg className="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>

        {/* Title or rename input */}
        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={onRenameKeyDown}
            onBlur={onRenameBlur}
            onClick={(e) => e.stopPropagation()}
            className="text-sm flex-1 bg-transparent border-b focus:outline-none"
            style={{
              color: "var(--on-surface)",
              borderColor: "var(--primary)",
              fontFamily: "var(--font-display)",
            }}
          />
        ) : (
          <span className="text-sm truncate flex-1" style={{ fontFamily: "var(--font-display)" }}>
            {conv.title}
          </span>
        )}

        {/* Shared indicator */}
        {conv.shared_with && isOwner && (
          <svg
            className="w-3 h-3 shrink-0 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}

        {/* Context menu trigger */}
        {isOwner && !isRenaming && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle(conv.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
            style={{ color: "var(--on-surface-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--on-surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-muted)")}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Context Menu */}
      {isMenuOpen && isOwner && (
        <div
          ref={menuRef}
          className="absolute right-2 top-10 z-50 w-44 rounded-lg py-1.5 shadow-xl"
          style={{
            background: "var(--surface-container-highest)",
            border: "1px solid rgba(183, 196, 255, 0.1)",
          }}
        >
          {/* Rename */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartRename(conv);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
            style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-container-high)";
              e.currentTarget.style.color = "var(--on-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--on-surface-variant)";
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </button>

          {/* Move to project */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveMenuToggle(conv.id);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
            style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-container-high)";
              e.currentTarget.style.color = "var(--on-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--on-surface-variant)";
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Move to...
            <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Move submenu */}
          {moveMenuId === conv.id && (
            <div
              className="mx-2 mt-1 mb-1 rounded-lg py-1"
              style={{ background: "var(--surface-container-high)" }}
            >
              {/* Unfiled option */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveConversation(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                style={{
                  color: !conv.project_id ? "var(--primary)" : "var(--on-surface-variant)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-container)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {!conv.project_id && (
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={!conv.project_id ? "font-medium" : ""}>Unfiled</span>
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveConversation(p.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{
                    color: conv.project_id === p.id ? "var(--primary)" : "var(--on-surface-variant)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-container)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {conv.project_id === p.id && (
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className={conv.project_id === p.id ? "font-medium" : ""}>{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Share submenu trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareMenuToggle(conv.id);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
            style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-container-high)";
              e.currentTarget.style.color = "var(--on-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--on-surface-variant)";
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {conv.shared_with ? "Sharing..." : "Share"}
            <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Share submenu */}
          {shareMenuId === conv.id && (
            <div
              className="mx-2 mt-1 mb-1 rounded-lg py-1"
              style={{ background: "var(--surface-container-high)" }}
            >
              {shareUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(conv.id, conv.shared_with === user.id ? null : user.id);
                    onMenuToggle(conv.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{
                    color: conv.shared_with === user.id ? "var(--primary)" : "var(--on-surface-variant)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-container)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {conv.shared_with === user.id && (
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className={conv.shared_with === user.id ? "font-medium" : ""}>
                    {user.display_name}
                  </span>
                </button>
              ))}
              {conv.shared_with && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(conv.id, null);
                    onMenuToggle(conv.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{ color: "var(--accent-red)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-container)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Remove sharing
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="my-1 mx-3" style={{ borderTop: "1px solid rgba(183, 196, 255, 0.08)" }} />

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conv.id);
              onMenuToggle(conv.id);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
            style={{ color: "var(--accent-red)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 123, 123, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
