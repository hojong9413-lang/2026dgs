"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  Download,
  Search,
  Sidebar,
  Music,
  Video,
  FileSpreadsheet,
  File as FileIcon,
  HardDrive,
  ExternalLink,
  Link as LinkIcon,
  LogOut,
  ShieldCheck,
  Calendar,
  Tag,
  AlignLeft,
  UserCheck,
  Layers,
  Bot,
} from "lucide-react";
import SecurityLockScreen from "./SecurityLockScreen";
import ObsidianCalendarView from "./ObsidianCalendarView";

interface FileNode {
  name: string;
  path: string;
  type: "directory" | "file";
  extension?: string;
  size?: number;
  updatedAt?: string;
  children?: FileNode[];
}

interface TabHistoryItem {
  name: string;
  path: string;
  ext: string;
}

interface TabItem {
  id: string;
  name: string;
  path: string;
  ext: string;
  history: TabHistoryItem[];
  historyIndex: number;
}

interface FileDetail {
  name: string;
  path: string;
  extension: string;
  size: number;
  updatedAt: string;
  isText: boolean;
  content: string | null;
}

interface ParsedMarkdownData {
  frontmatter: Record<string, any> | null;
  extractedTitle: string | null;
  body: string;
}

// 옵시디언 표준 YAML Frontmatter(속성) 파서
function parseObsidianMarkdown(rawContent: string): ParsedMarkdownData {
  const content = rawContent || "";
  let frontmatter: Record<string, any> | null = null;
  let remainingBody = content;

  // YAML Frontmatter 파싱 (^---\r?\n ... \r?\n---\r?\n)
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (frontmatterMatch) {
    const rawYaml = frontmatterMatch[1];
    remainingBody = content.slice(frontmatterMatch[0].length);
    const data: Record<string, any> = {};
    const lines = rawYaml.split(/\r?\n/);
    let currentKey: string | null = null;
    let currentList: string[] | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const listItemMatch = line.match(/^\s*-\s+(.*)$/);
      if (listItemMatch && currentKey && currentList) {
        currentList.push(listItemMatch[1].trim());
        continue;
      }

      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const rawVal = line.slice(colonIdx + 1).trim();

        if (rawVal === "") {
          currentKey = key;
          currentList = [];
          data[key] = currentList;
        } else if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
          data[key] = rawVal
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean);
          currentKey = null;
          currentList = null;
        } else {
          data[key] = rawVal.replace(/^['"]|['"]$/g, "");
          currentKey = null;
          currentList = null;
        }
      }
    }
    if (Object.keys(data).length > 0) {
      frontmatter = data;
    }
  }

  // 본문 최상단 H1(# 제목) 추출
  let extractedTitle: string | null = null;
  const titleMatch = remainingBody.match(/^\s*#\s+([^\r\n]+)/);
  if (titleMatch) {
    extractedTitle = titleMatch[1].trim();
    // 상단 단독 제목은 별도 렌더링을 위해 본문 시작부에서 제거
    remainingBody = remainingBody.replace(/^\s*#\s+[^\r\n]+(\r?\n)*/, "");
  } else if (frontmatter?.title && typeof frontmatter.title === "string") {
    extractedTitle = frontmatter.title;
  }

  return {
    frontmatter,
    extractedTitle,
    body: remainingBody,
  };
}

function getPropertyIcon(key: string) {
  const lowerKey = key.toLowerCase();
  if (
    lowerKey.includes("일자") ||
    lowerKey.includes("date") ||
    lowerKey.includes("일시") ||
    lowerKey.includes("기간")
  ) {
    return <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  if (lowerKey === "tags" || lowerKey.includes("태그")) {
    return <Tag className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  if (lowerKey.includes("출처") || lowerKey.includes("source")) {
    return <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  if (lowerKey.includes("보안") || lowerKey.includes("security")) {
    return <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  if (
    lowerKey.includes("검수자") ||
    lowerKey.includes("작성자") ||
    lowerKey.includes("author") ||
    lowerKey.includes("연구원")
  ) {
    return <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  if (lowerKey.includes("단계") || lowerKey.includes("status")) {
    return <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  if (lowerKey.includes("ai") || lowerKey.includes("인공지능")) {
    return <Bot className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
  }
  return <AlignLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />;
}

// 옵시디언 1.4+ 네이티브 속성(Properties) UI 컴포넌트
function ObsidianProperties({ properties }: { properties: Record<string, any> }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const keys = Object.keys(properties).filter((k) => k !== "title");

  if (keys.length === 0) return null;

  return (
    <div className="mb-6 select-text font-sans">
      {/* 속성 토글 헤더 */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 cursor-pointer select-none transition-colors group"
      >
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-150 ${
            isCollapsed ? "-rotate-90" : ""
          }`}
        />
        <span>속성</span>
        <span className="text-[10px] text-slate-400 font-normal">({keys.length})</span>
      </button>

      {/* 속성 목록 (옵시디언 1.4+ 표준 테이블형 레이아웃) */}
      {!isCollapsed && (
        <div className="space-y-0.5 pl-1">
          {keys.map((key) => {
            const val = properties[key];
            const isTags =
              key.toLowerCase() === "tags" ||
              key.toLowerCase() === "태그" ||
              Array.isArray(val);
            const isDate =
              key.toLowerCase().includes("일자") ||
              key.toLowerCase().includes("date") ||
              (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val));

            return (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:items-baseline py-1 group hover:bg-slate-100/70 rounded px-2 -mx-2 transition-colors gap-1 sm:gap-6"
              >
                {/* 속성 이름 (좌측 열) */}
                <div className="w-28 sm:w-32 shrink-0 flex items-center gap-2 text-slate-500 text-[13px] select-none font-medium">
                  {getPropertyIcon(key)}
                  <span className="truncate">{key}</span>
                </div>

                {/* 속성 값 (우측 열) */}
                <div className="flex-1 text-[13px] text-slate-800 break-keep">
                  {isTags && Array.isArray(val) ? (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {val.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#f0ecfc] text-[#6b46c1] border border-[#e2d9f8] hover:bg-[#e9e1fa] transition-colors"
                        >
                          <span>{tag}</span>
                          <span className="text-purple-400 text-[10px] select-none">✕</span>
                        </span>
                      ))}
                    </div>
                  ) : isDate ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-800 text-[13px] font-mono">
                      <span>📅 {String(val)}</span>
                    </span>
                  ) : typeof val === "boolean" ? (
                    <span className="font-mono text-xs text-slate-600">
                      {val ? "True" : "False"}
                    </span>
                  ) : (
                    <span className="text-slate-800 leading-relaxed">{String(val)}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* 속성 추가 행 (옵시디언 네이티브 룩앤필 재현) */}
          <div className="pt-2 text-[12px] text-slate-400 flex items-center gap-1.5 select-none pl-1 cursor-default">
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>속성 추가</span>
          </div>
        </div>
      )}

      {/* 속성과 본문 사이의 미세 구분선 */}
      <div className="border-b border-slate-200/70 mt-4 mb-6" />
    </div>
  );
}

export default function ObsidianWebPlatform() {
  // 인증 상태 관리 (null: 초기 확인 중, false: 잠금 화면, true: 플랫폼 접근 허용)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [tree, setTree] = useState<FileNode[]>([]);
  const [loadingTree, setLoadingTree] = useState<boolean>(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["00_과업개요", "02_주요진행상황", "03_회의록", "04_보고서파일", "50_FGI"])
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // 사이드바 너비 마우스 드래그 조절 상태 (기본 280px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // 탭 관리 (각 탭마다 자체 뒤로가기/앞으로가기 히스토리 보존)
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: "tab-home",
      name: "새 탭",
      path: "",
      ext: "",
      history: [{ name: "새 탭", path: "", ext: "" }],
      historyIndex: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-home");

  // 파일 캐시
  const [fileData, setFileData] = useState<Record<string, FileDetail>>({});
  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  // 1. 초기 인증 상태 확인
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        const json = await res.json();
        setIsAuthenticated(Boolean(json.authenticated));
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 2. 트리 로드 함수 (인증 성공 시 호출)
  const loadTree = useCallback(async () => {
    setLoadingTree(true);
    try {
      const res = await fetch("/api/vault/tree");
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const json = await res.json();
      if (json.success && json.tree) {
        setTree(json.tree);
      }
    } catch (err) {
      console.error("Failed to load vault tree", err);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTree();
    }
  }, [isAuthenticated, loadTree]);

  // 로그아웃 처리
  const handleLogout = async () => {
    if (!confirm("보안 세션을 종료하고 로그아웃하시겠습니까?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setTree([]);
      setTabs([
        {
          id: "tab-home",
          name: "새 탭",
          path: "",
          ext: "",
          history: [{ name: "새 탭", path: "", ext: "" }],
          historyIndex: 0,
        },
      ]);
      setActiveTabId("tab-home");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // 사이드바 너비 마우스 드래그 리사이징 이벤트 등록
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxAllowed = Math.min(window.innerWidth * 0.65, 700);
      const newWidth = Math.max(180, Math.min(e.clientX, maxAllowed));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // 보관함 내 전수 파일 평탄화 (위키링크 [[...]] 검색용)
  const allFilesList = useMemo(() => {
    const list: FileNode[] = [];
    function traverse(nodes: FileNode[]) {
      for (const node of nodes) {
        if (node.type === "file") {
          list.push(node);
        } else if (node.children) {
          traverse(node.children);
        }
      }
    }
    traverse(tree);
    return list;
  }, [tree]);

  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // 활성 탭 파일 내용 로드
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!activeTab || !activeTab.path) return;
    if (activeTab.ext === "calendar") return;
    if (fileData[activeTab.path]) return;

    async function loadFileContent(filePath: string) {
      setLoadingFile(true);
      try {
        const res = await fetch(`/api/vault/file?path=${encodeURIComponent(filePath)}`);
        if (res.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        const json = await res.json();
        if (json.success && json.file) {
          setFileData((prev) => ({ ...prev, [filePath]: json.file }));
        }
      } catch (err) {
        console.error("Failed to fetch file content", err);
      } finally {
        setLoadingFile(false);
      }
    }

    loadFileContent(activeTab.path);
  }, [activeTab, fileData, isAuthenticated]);

  // 폴더 토글
  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  // 좌측 파일 탐색기에서 파일 클릭 시 열기
  const handleOpenFile = (node: FileNode) => {
    const existing = tabs.find((t) => t.path === node.path);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    if (tabs.length === 1 && !tabs[0].path) {
      const updatedTab: TabItem = {
        id: tabs[0].id,
        name: node.name,
        path: node.path,
        ext: node.extension || "",
        history: [{ name: node.name, path: node.path, ext: node.extension || "" }],
        historyIndex: 0,
      };
      setTabs([updatedTab]);
      setActiveTabId(updatedTab.id);
      return;
    }

    const newTab: TabItem = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: node.name,
      path: node.path,
      ext: node.extension || "",
      history: [{ name: node.name, path: node.path, ext: node.extension || "" }],
      historyIndex: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // 내부 링크 클릭 시: [현재 활성 창(자체 창)]에서 바로 이동
  const handleOpenByLinkName = (linkText: string) => {
    let cleanTarget = linkText.split("#")[0].trim().toLowerCase();
    if (!cleanTarget) return;

    if (cleanTarget.endsWith("/")) {
      const folderTarget = cleanTarget.slice(0, -1);
      setExpandedFolders((prev) => new Set([...prev, folderTarget]));
      return;
    }

    const targetBaseName = cleanTarget.split("/").pop() || cleanTarget;
    const targetBaseNameWithoutExt = targetBaseName.replace(/\.[^/.]+$/, "");

    const match = allFilesList.find((f) => {
      const fPathLower = f.path.toLowerCase();
      const fNameLower = f.name.toLowerCase();
      const fBaseWithoutExt = f.name.replace(/\.[^/.]+$/, "").toLowerCase();

      if (fPathLower === cleanTarget) return true;
      if (fPathLower.replace(/\.[^/.]+$/, "") === cleanTarget) return true;
      if (fNameLower === targetBaseName) return true;
      if (fBaseWithoutExt === targetBaseNameWithoutExt) return true;

      return false;
    });

    if (match) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id === activeTabId) {
            const nextHistory = tab.history.slice(0, tab.historyIndex + 1);
            nextHistory.push({
              name: match.name,
              path: match.path,
              ext: match.extension || "",
            });
            return {
              ...tab,
              name: match.name,
              path: match.path,
              ext: match.extension || "",
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
            };
          }
          return tab;
        })
      );
    } else {
      alert(`[안내] 보관함에서 연결된 파일 '${linkText}'을(를) 찾을 수 없습니다.`);
    }
  };

  // 과업 캘린더 (Obsidian Full Calendar) 탭 열기
  const handleOpenCalendar = () => {
    const existing = tabs.find((t) => t.ext === "calendar");
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    if (tabs.length === 1 && !tabs[0].path) {
      const updatedTab: TabItem = {
        id: tabs[0].id,
        name: "과업 캘린더",
        path: "calendar",
        ext: "calendar",
        history: [{ name: "과업 캘린더", path: "calendar", ext: "calendar" }],
        historyIndex: 0,
      };
      setTabs([updatedTab]);
      setActiveTabId(updatedTab.id);
      return;
    }

    const newTab: TabItem = {
      id: `tab-calendar-${Date.now()}`,
      name: "과업 캘린더",
      path: "calendar",
      ext: "calendar",
      history: [{ name: "과업 캘린더", path: "calendar", ext: "calendar" }],
      historyIndex: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // 캘린더 내 일정 클릭 시 해당 노트 열람
  const handleOpenNoteFromCalendar = (notePath: string) => {
    const targetBaseName = notePath.split("/").pop() || notePath;
    const match = allFilesList.find((f) => {
      const fPathLower = f.path.toLowerCase();
      const fNameLower = f.name.toLowerCase();
      return (
        fPathLower === notePath.toLowerCase() ||
        fNameLower === targetBaseName.toLowerCase() ||
        fPathLower.endsWith(notePath.toLowerCase())
      );
    });

    if (match) {
      const existing = tabs.find((t) => t.path === match.path);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }

      const newTab: TabItem = {
        id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: match.name,
        path: match.path,
        ext: match.extension || "",
        history: [{ name: match.name, path: match.path, ext: match.extension || "" }],
        historyIndex: 0,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } else {
      handleOpenByLinkName(notePath);
    }
  };

  // 현재 탭 내 뒤로가기
  const handleGoBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIndex = activeTab.historyIndex - 1;
    const targetHistory = activeTab.history[newIndex];

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              name: targetHistory.name,
              path: targetHistory.path,
              ext: targetHistory.ext,
              historyIndex: newIndex,
            }
          : tab
      )
    );
  };

  // 현재 탭 내 앞으로가기
  const handleGoForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIndex = activeTab.historyIndex + 1;
    const targetHistory = activeTab.history[newIndex];

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              name: targetHistory.name,
              path: targetHistory.path,
              ext: targetHistory.ext,
              historyIndex: newIndex,
            }
          : tab
      )
    );
  };

  // 탭 닫기
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      setTabs([
        {
          id: "tab-home",
          name: "새 탭",
          path: "",
          ext: "",
          history: [{ name: "새 탭", path: "", ext: "" }],
          historyIndex: 0,
        },
      ]);
      setActiveTabId("tab-home");
      return;
    }

    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  // 새 탭 추가
  const handleAddTab = () => {
    const newTab: TabItem = {
      id: `tab-${Date.now()}`,
      name: "새 탭",
      path: "",
      ext: "",
      history: [{ name: "새 탭", path: "", ext: "" }],
      historyIndex: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // 확장자 뱃지
  const renderBadge = (ext?: string) => {
    if (!ext) return null;
    const cleanExt = ext.replace(".", "").toUpperCase();
    if (cleanExt === "MD") return null;

    let badgeColor = "bg-slate-100 text-slate-600 border-slate-300";
    if (cleanExt === "PDF") badgeColor = "bg-rose-50 text-rose-600 border-rose-200";
    if (["XLSX", "XLS", "CSV"].includes(cleanExt))
      badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (["PPTX", "PPT"].includes(cleanExt))
      badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
    if (["M4A", "MP3", "WAV"].includes(cleanExt))
      badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
    if (["MP4"].includes(cleanExt)) badgeColor = "bg-blue-50 text-blue-700 border-blue-200";

    return (
      <span
        className={`text-[10px] font-semibold px-1 py-0.2 rounded border font-mono shrink-0 ml-1.5 uppercase ${badgeColor}`}
      >
        {cleanExt}
      </span>
    );
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // 파일 트리 렌더러
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return (
      <ul className={`space-y-0.5 ${depth > 0 ? "pl-3 border-l border-slate-200 ml-1.5" : ""}`}>
        {nodes.map((node) => {
          if (node.type === "directory") {
            const isExpanded = expandedFolders.has(node.path);
            return (
              <li key={node.path} className="select-none">
                <button
                  onClick={() => toggleFolder(node.path)}
                  className="w-full flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-slate-100 text-slate-800 text-[13px] font-medium transition-colors text-left group"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 group-hover:text-slate-600 shrink-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                  <Folder className="w-4 h-4 text-amber-500/80 shrink-0" />
                  <span className="truncate flex-1">{node.name}</span>
                  {node.name.includes("01_과업일정") && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCalendar();
                      }}
                      className="ml-auto text-[10px] font-bold text-[#705dcf] bg-purple-100 hover:bg-purple-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-0.5"
                      title="옵시디언 과업 캘린더 뷰 열기"
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      <span>달력</span>
                    </span>
                  )}
                </button>
                {isExpanded && node.children && node.children.length > 0 && renderTree(node.children, depth + 1)}
              </li>
            );
          }

          const isSelected = activeTab && activeTab.path === node.path;
          return (
            <li key={node.path} className="select-none">
              <button
                onClick={() => handleOpenFile(node)}
                className={`w-full flex items-center justify-between py-1 px-1.5 rounded-md text-[13px] transition-colors text-left group ${
                  isSelected
                    ? "bg-[#e5effa] text-sky-900 font-semibold"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {node.extension === ".md" ? (
                      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    ) : ["m4a", "mp3"].includes((node.extension || "").replace(".", "")) ? (
                      <Music className="w-3.5 h-3.5 text-purple-500" />
                    ) : node.extension === ".mp4" ? (
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <FileIcon className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </span>
                  <span className="truncate">{node.name.replace(/\.md$/, "")}</span>
                </div>
                {renderBadge(node.extension)}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;

    function filterNodes(nodes: FileNode[]): FileNode[] {
      const results: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === "directory" && node.children) {
          const matchingChildren = filterNodes(node.children);
          if (matchingChildren.length > 0 || node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ ...node, children: matchingChildren });
          }
        } else if (node.type === "file") {
          if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push(node);
          }
        }
      }
      return results;
    }

    return filterNodes(tree);
  }, [tree, searchQuery]);

  const currentDetail = activeTab && activeTab.path ? fileData[activeTab.path] : null;

  // 마크다운 파싱 (옵시디언 YAML Frontmatter 속성 분리 및 위키링크 [[노트명|별칭]] 전처리)
  const parsedMarkdown = useMemo(() => {
    if (!currentDetail?.content) {
      return { frontmatter: null, extractedTitle: null, body: "" };
    }
    const parsed = parseObsidianMarkdown(currentDetail.content);

    // 위키링크 치환
    const processedBody = parsed.body.replace(
      /\[\[(.*?)(?:\|(.*?))?\]\]/g,
      (match, note, alias) => {
        const displayText = alias ? alias.trim() : note.trim();
        const targetNote = encodeURIComponent(note.trim());
        return `[${displayText}](#vault-internal-${targetNote})`;
      }
    );

    // 표시 타이틀 결정 (추출된 제목이 없으나 frontmatter가 있는 경우 파일명 활용)
    const displayTitle =
      parsed.extractedTitle ||
      (parsed.frontmatter && activeTab?.name
        ? activeTab.name.replace(/\.md$/, "")
        : null);

    return {
      frontmatter: parsed.frontmatter,
      extractedTitle: displayTitle,
      body: processedBody,
    };
  }, [currentDetail?.content, activeTab?.name]);

  const canGoBack = activeTab && activeTab.historyIndex > 0;
  const canGoForward = activeTab && activeTab.historyIndex < activeTab.history.length - 1;

  // =========================================================
  // 보안 가드: 인증 상태 확인 중 또는 미인증 시 분기
  // =========================================================
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 font-sans">
        <span className="inline-block w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs tracking-wider text-slate-400">보안 자격증명 확인 중...</span>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <SecurityLockScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  // =========================================================
  // 본문 인터페이스 (인증 통과 시)
  // =========================================================
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fbfbfb] text-[#222222] font-sans antialiased select-none">
      {/* 1. 좌측 파일 탐색기 사이드바 */}
      {isSidebarOpen && (
        <>
          <aside
            style={{ width: `${sidebarWidth}px` }}
            className="border-r border-[#e3e3e6] bg-[#f7f7f8] flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-3 border-b border-[#e3e3e6] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight text-slate-800">
                    2026DGS 보관함
                  </span>
                  <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    보안인가됨
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleOpenCalendar}
                    title="01_과업일정 캘린더 열기"
                    className="p-1 text-[#705dcf] hover:text-[#553c9a] hover:bg-purple-100 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold px-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>캘린더</span>
                  </button>
                  <button
                    onClick={() => setExpandedFolders(new Set())}
                    title="모든 폴더 접기"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="파일 또는 폴더 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e3e3e6] rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {loadingTree ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  보관함 트리를 불러오는 중...
                </div>
              ) : filteredTree.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  일치하는 파일이 없습니다.
                </div>
              ) : (
                renderTree(filteredTree)
              )}
            </div>

            <div className="h-8 border-t border-[#e3e3e6] px-3 flex items-center justify-between text-[11px] text-slate-500 bg-[#f7f7f8]">
              <div className="flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3 h-3 text-slate-400" />
                <span>vault</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                2026dgs.cloud
              </span>
            </div>
          </aside>

          {/* 좌우 경계선 마우스 드래그 리사이저 핸들 */}
          <div
            onMouseDown={() => setIsResizing(true)}
            className={`w-1 -ml-0.5 cursor-col-resize z-20 hover:bg-sky-400 transition-colors select-none ${
              isResizing ? "bg-sky-500 shadow-xs" : "bg-transparent"
            }`}
            title="마우스로 드래그하여 사이드바 너비를 조절할 수 있습니다"
          />
        </>
      )}

      {/* 2. 우측 메인 작업 영역 */}
      <section className="flex-1 flex flex-col min-w-0 bg-white">
        {/* 상단 탭 바 */}
        <div className="h-10 bg-[#ededf0] border-b border-[#e3e3e6] flex items-center px-1 gap-1 overflow-x-auto select-none">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            title="사이드바 열기/닫기"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded transition-colors mr-1"
          >
            <Sidebar className="w-4 h-4" />
          </button>

          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group h-8 px-3 rounded-t-md flex items-center gap-2 text-xs font-medium cursor-pointer border-t-2 transition-all ${
                  isActive
                    ? "bg-white text-slate-900 border-sky-600 shadow-xs"
                    : "bg-[#e5e5e8] text-slate-600 border-transparent hover:bg-[#e9e9ec] hover:text-slate-800"
                }`}
              >
                {tab.ext === "calendar" && (
                  <Calendar className="w-3.5 h-3.5 text-[#705dcf] shrink-0" />
                )}
                <span className="max-w-[160px] truncate">
                  {tab.name.replace(/\.md$/, "")}
                </span>
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  title="탭 닫기"
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded p-0.5 transition-opacity text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            onClick={handleAddTab}
            title="새 탭 열기"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded transition-colors ml-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenCalendar}
            title="01_과업일정 캘린더 탭 열기"
            className="p-1 text-[#705dcf] hover:text-[#553c9a] hover:bg-purple-100 rounded transition-colors ml-1 flex items-center gap-1 text-xs font-semibold px-2 cursor-pointer border border-purple-200/60 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden md:inline">과업 캘린더</span>
          </button>
        </div>

        {/* 탭 네비게이션 서브바 (뒤로가기, 앞으로가기, 경로, 다운로드, 로그아웃) */}
        <div className="h-9 border-b border-[#e3e3e6] bg-white px-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <button
              onClick={handleGoBack}
              disabled={!canGoBack}
              title="이전 문서로 뒤로가기"
              className={`p-1 rounded transition-colors ${
                canGoBack
                  ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleGoForward}
              disabled={!canGoForward}
              title="다음 문서로 앞으로가기"
              className={`p-1 rounded transition-colors ${
                canGoForward
                  ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-px bg-slate-200 mx-1" />

            <span className="text-slate-400 font-mono text-[11px]">경로:</span>
            <span className="font-medium text-slate-800 truncate">
              {activeTab && activeTab.ext === "calendar"
                ? "vault / 01_과업일정 / Calendar (Obsidian Full Calendar 뷰)"
                : activeTab && activeTab.path
                ? `vault / ${activeTab.path}`
                : "시작 화면"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab && activeTab.path && activeTab.ext !== "calendar" && (
              <a
                href={`/api/vault/raw?path=${encodeURIComponent(activeTab.path)}&download=true`}
                download
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>원본 다운로드</span>
              </a>
            )}

            {/* 보안 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              title="보안 로그아웃"
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* 본문 콘텐츠 렌더링 영역 */}
        <main className="flex-1 overflow-y-auto bg-white select-text">
          {(!activeTab || !activeTab.path) && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
              <div className="max-w-xl w-full space-y-8">
                {/* 큼직한 상단 아이콘 */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                  <HardDrive className="w-10 h-10" />
                </div>

                {/* 큼직하고 선명한 타이틀 & 부제목 */}
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    2026dgs 과업 문서 및 미디어 공유 플랫폼
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    대한민국 구석구석 FGI 과업 옵시디언(Obsidian) 보관함과 실시간 연동되어 있습니다.
                  </p>
                </div>

                {/* 시원시원한 안내 카드들 */}
                <div className="space-y-3 pt-2">
                  <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <div className="text-sm sm:text-base font-bold text-slate-800">
                        좌측 탐색기에서 열람할 문서를 선택하십시오.
                      </div>
                      <div className="text-xs text-slate-500">
                        회의록, 착수보고서, FGI 분석 마크다운 및 실무 파일 제공
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-200/70 text-slate-700 shrink-0 ml-3">
                      클릭 즉시 열람
                    </span>
                  </div>

                  <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <div className="text-sm sm:text-base font-bold text-slate-800">
                        본문 속 [[내부링크]] 클릭 시 현재 창에서 즉시 이동
                      </div>
                      <div className="text-xs text-slate-500">
                        상단 좌측 뒤로가기(←) 및 앞으로가기(→)로 이전 문서 복귀 지원
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-sky-100 text-sky-800 shrink-0 ml-3">
                      스마트 링크 지원
                    </span>
                  </div>

                  <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <div className="text-sm sm:text-base font-bold text-slate-800">
                        옵시디언 노트, PDF, 이미지, 음성녹음파일 보기 지원
                      </div>
                      <div className="text-xs text-slate-500">
                        기타 PPT, EXCEL, HWP 등 업무용 문서는 원클릭 다운로드 지원
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 shrink-0 ml-3">
                      뷰어 / 다운로드
                    </span>
                  </div>

                  <div
                    onClick={handleOpenCalendar}
                    className="border border-purple-200/90 rounded-xl p-4 sm:p-5 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 hover:from-purple-100 hover:to-indigo-100 transition-all text-left flex items-center justify-between shadow-xs cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm sm:text-base font-bold text-purple-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#705dcf]" />
                        <span>01_과업일정 캘린더 (Obsidian Full Calendar)</span>
                      </div>
                      <div className="text-xs text-purple-700/80">
                        총 62개 마일스톤 및 주요 마감일 월간 캘린더 뷰 연동, 클릭 시 해당 일정 노트 바로가기
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#705dcf] text-white shrink-0 ml-3 shadow-2xs group-hover:brightness-110 flex items-center gap-1">
                      <span>캘린더 열기</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 과업 캘린더 뷰 (Obsidian Full Calendar 복제) */}
          {activeTab && activeTab.ext === "calendar" && (
            <div className="h-full w-full flex flex-col overflow-hidden">
              <ObsidianCalendarView onOpenNote={handleOpenNoteFromCalendar} />
            </div>
          )}

          {activeTab && activeTab.path && activeTab.ext !== "calendar" && loadingFile && (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              문서를 불러오는 중입니다...
            </div>
          )}

          {/* 마크다운 문서 (.md) 열람 */}
          {activeTab && activeTab.path && activeTab.ext !== "calendar" && !loadingFile && currentDetail && currentDetail.isText && (
            <div className="max-w-4xl mx-auto px-8 py-10">
              {/* 메인 타이틀 (옵시디언 상단 타이틀) */}
              {parsedMarkdown.extractedTitle && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-5 pb-1">
                  {parsedMarkdown.extractedTitle}
                </h1>
              )}

              {/* 옵시디언 표준 템플릿 속성 (Properties) 컴포넌트 */}
              {parsedMarkdown.frontmatter && (
                <ObsidianProperties properties={parsedMarkdown.frontmatter} />
              )}

              <article className="prose prose-slate max-w-none text-[15px] leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => url}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-2 mt-6 mb-4"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl font-bold text-slate-800 mt-6 mb-3 border-b border-slate-100 pb-1"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-bold text-slate-800 mt-5 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="my-2.5 text-slate-700 leading-relaxed break-keep" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 my-2 space-y-1 text-slate-700" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-700" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="text-slate-700" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-sky-500 pl-4 py-1 my-3 bg-sky-50/50 text-slate-700 italic rounded-r"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table
                          className="w-full border-collapse border border-slate-300 text-xs text-left"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead
                        className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800"
                        {...props}
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-slate-300 px-3 py-2 text-slate-800" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-slate-300 px-3 py-2 text-slate-700" {...props} />
                    ),
                    code: ({ node, className, children, ...props }) => (
                      <code
                        className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    ),
                    a: ({ node, href, children, ...props }) => {
                      if (href && href.startsWith("#vault-internal-")) {
                        const target = decodeURIComponent(href.replace("#vault-internal-", ""));
                        return (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenByLinkName(target);
                            }}
                            className="text-sky-600 underline font-medium cursor-pointer hover:text-sky-800 transition-colors bg-sky-50/70 hover:bg-sky-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                            title={`현재 창에서 열기: ${target}`}
                          >
                            <LinkIcon className="w-3 h-3 text-sky-500 inline" />
                            <span>{children}</span>
                          </span>
                        );
                      }

                      if (
                        href &&
                        !href.startsWith("http://") &&
                        !href.startsWith("https://") &&
                        !href.startsWith("mailto:")
                      ) {
                        return (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenByLinkName(href);
                            }}
                            className="text-sky-600 underline font-medium cursor-pointer hover:text-sky-800 transition-colors bg-sky-50/70 hover:bg-sky-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                            title={`현재 창에서 열기: ${href}`}
                          >
                            <LinkIcon className="w-3 h-3 text-sky-500 inline" />
                            <span>{children}</span>
                          </span>
                        );
                      }

                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 underline font-medium hover:text-sky-800 inline-flex items-center gap-0.5"
                          {...props}
                        >
                          <span>{children}</span>
                          <ExternalLink className="w-3 h-3 inline text-slate-400" />
                        </a>
                      );
                    },
                  }}
                >
                  {parsedMarkdown.body}
                </ReactMarkdown>
              </article>
            </div>
          )}

          {/* PDF 문서 인라인 열람 */}
          {activeTab && activeTab.path && !loadingFile && activeTab.ext.toLowerCase() === ".pdf" && (
            <div className="h-full flex flex-col">
              <iframe
                src={`/api/vault/raw?path=${encodeURIComponent(activeTab.path)}`}
                className={`w-full h-full border-none ${isResizing ? "pointer-events-none" : ""}`}
                title={activeTab.name}
              />
            </div>
          )}

          {/* 대용량 음원 (.m4a, .mp3) */}
          {activeTab &&
            activeTab.path &&
            !loadingFile &&
            [".m4a", ".mp3", ".wav"].includes(activeTab.ext.toLowerCase()) && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                  <div className="w-14 h-14 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Music className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 truncate">{activeTab.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">인터뷰 / 회의 녹취 오디오 스트리밍</p>
                  </div>

                  <audio
                    controls
                    className="w-full mt-2"
                    src={`/api/vault/raw?path=${encodeURIComponent(activeTab.path)}`}
                  >
                    브라우저가 오디오 재생을 지원하지 않습니다.
                  </audio>

                  <div className="pt-2">
                    <a
                      href={`/api/vault/raw?path=${encodeURIComponent(activeTab.path)}&download=true`}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>음원 파일 원본 다운로드</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

          {/* 실무 첨부파일 다운로드 카드 (.xlsx, .pptx, .hwp 등) */}
          {activeTab &&
            activeTab.path &&
            !loadingFile &&
            ![".md", ".pdf", ".m4a", ".mp3", ".wav"].includes(activeTab.ext.toLowerCase()) && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                  <div className="w-14 h-14 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 break-words">{activeTab.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1.5 font-mono">
                      <span>형식: {activeTab.ext.toUpperCase()}</span>
                      {currentDetail?.size && <span>• 용량: {formatBytes(currentDetail.size)}</span>}
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed text-left">
                    본 문서는 전용 오피스 뷰어가 필요한 바이너리 파일입니다. 아래 다운로드 버튼을 클릭하여 로컬 PC에서 즉시 열람하십시오.
                  </div>

                  <div className="pt-2">
                    <a
                      href={`/api/vault/raw?path=${encodeURIComponent(activeTab.path)}&download=true`}
                      download
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>파일 다운로드 ({activeTab.ext.toUpperCase()})</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
        </main>
      </section>
    </div>
  );
}
