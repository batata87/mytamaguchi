"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Bed, Hand, Pizza, ShowerHead, Circle, X } from "lucide-react";
import type { PetStage } from "@/lib/game";
import { ACTIVITY_SUBMENUS, STAR_ELIXIR_ITEM, type CareAction } from "@/lib/activitySubmenus";

export type DragAction = "feed" | "sleep" | "play" | "clean" | "pet";

type SidebarProps = {
  stage: PetStage;
  activeAction: CareAction | null;
  isSick?: boolean;
  disabled?: boolean;
  onDragPoint: (point: { x: number; y: number }) => void;
  /** Drag-from-sidebar Pet tool (egg hatch / petting). */
  onDropPet: (point: { x: number; y: number }) => void;
  /** Drag sub-item from activity hover menu onto creature. */
  onSubDrop: (action: CareAction, subId: string, point: { x: number; y: number }) => void;
  onToggleAction: (action: CareAction) => void;
  onCloseMenu: () => void;
};

const careActions: Array<{ action: CareAction; label: string; icon: ReactNode }> = [
  { action: "feed", label: "Feed", icon: <Pizza size={18} /> },
  { action: "sleep", label: "Sleep", icon: <Bed size={18} /> },
  { action: "play", label: "Play", icon: <Circle size={18} className="fill-amber-400/30" /> },
  { action: "clean", label: "Clean", icon: <ShowerHead size={18} /> }
];

const actionImageMap: Partial<Record<CareAction, string>> = {
  feed: "/assets/berries.png",
  sleep: "/assets/cloudbed.png",
  play: "/assets/ball.png",
  clean: "/assets/clean_menu_icon.png"
};

const subItemImageMap: Record<string, string> = {
  berries: "/assets/berries.png",
  mooncake: "/assets/cookie.png",
  soup: "/assets/soup.png",
  catnap: "/assets/cloudbed.png",
  starlight: "/assets/cloudbed.png",
  dream: "/assets/cloudbed.png",
  orbit: "/assets/ball.png",
  comet: "/assets/ball.png",
  starhop: "/assets/yoyo.png"
};

function DraggablePetTool({
  label,
  icon,
  variant = "default",
  onDragPoint,
  onDropPet
}: {
  label: string;
  icon: ReactNode;
  variant?: "default" | "hatch" | "muted";
  onDragPoint: SidebarProps["onDragPoint"];
  onDropPet: SidebarProps["onDropPet"];
}) {
  const base =
    variant === "hatch"
      ? "flex min-h-[4.75rem] w-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-200/90 to-orange-100/85 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.45)] ring-2 ring-amber-300/60 sm:min-h-[5.5rem] sm:w-[5.75rem]"
      : variant === "muted"
        ? "flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/20 bg-white/10 text-slate-400 opacity-75"
        : "flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl border border-white/25 bg-white/15 text-slate-700 shadow-sm backdrop-blur-sm";

  return (
    <motion.button
      drag
      dragListener
      dragMomentum={false}
      dragSnapToOrigin
      whileDrag={{ scale: 1.08 }}
      dragTransition={{ power: 0, timeConstant: 120 }}
      onDrag={(_, info: PanInfo) => onDragPoint(info.point)}
      onDragEnd={(_, info: PanInfo) => onDropPet(info.point)}
      className={`${base} touch-none`}
      aria-label={label}
    >
      {icon}
      <span className={`font-semibold ${variant === "hatch" ? "text-[11px]" : "text-[10px]"}`}>{label}</span>
    </motion.button>
  );
}

function ActivityWithSubmenu({
  action,
  label,
  icon,
  muted,
  isSick,
  activeAction,
  onDragPoint,
  onSubDrop,
  onToggleAction,
  onCloseMenu
}: {
  action: CareAction;
  label: string;
  icon: ReactNode;
  muted: boolean;
  isSick: boolean;
  activeAction: CareAction | null;
  onDragPoint: SidebarProps["onDragPoint"];
  onSubDrop: SidebarProps["onSubDrop"];
  onToggleAction: SidebarProps["onToggleAction"];
  onCloseMenu: SidebarProps["onCloseMenu"];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const subs =
    isSick && (action === "feed" || action === "clean")
      ? [...ACTIVITY_SUBMENUS[action], STAR_ELIXIR_ITEM]
      : ACTIVITY_SUBMENUS[action];
  const open = activeAction === action;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onCloseMenu();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onCloseMenu]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => onToggleAction(action)}
        className={`flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center gap-1 rounded-2xl border text-slate-700 shadow-sm backdrop-blur-sm transition ${
          muted
            ? "border-white/15 bg-white/10 opacity-70"
            : open
              ? "border-violet-300 bg-white/30 ring-2 ring-violet-300/70"
              : "border-white/30 bg-white/15 hover:bg-white/25"
        }`}
      >
        {actionImageMap[action] ? (
          <Image src={actionImageMap[action]} alt="" width={28} height={28} unoptimized className="h-7 w-7 object-contain" />
        ) : (
          icon
        )}
        <span className="text-[10px] font-semibold">{label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 z-[60] mb-2 flex min-w-[148px] flex-col gap-1 rounded-xl border border-white/35 bg-slate-900/75 p-2 shadow-xl backdrop-blur-md sm:bottom-auto sm:right-full sm:top-0 sm:mb-0 sm:mr-2"
          >
            <div className="mb-1 flex items-center justify-between px-1">
              <p className="text-[8px] font-bold uppercase tracking-wide text-white/70">Choose & drag</p>
              <button type="button" onClick={onCloseMenu} className="text-white/70 hover:text-white">
                <X size={12} />
              </button>
            </div>
            {subs.map((sub) => (
              <motion.button
                key={sub.id}
                drag
                dragListener
                dragMomentum={false}
                dragSnapToOrigin
                whileDrag={{ scale: 1.05, zIndex: 70 }}
                dragTransition={{ power: 0, timeConstant: 120 }}
                onDrag={(_, info: PanInfo) => onDragPoint(info.point)}
                onDragEnd={(_, info: PanInfo) => onSubDrop(action, sub.id, info.point)}
                type="button"
                className="flex touch-none items-center gap-2 rounded-lg border border-white/20 bg-white/15 px-2 py-1.5 text-left text-[10px] font-semibold text-white hover:bg-white/25"
              >
                {subItemImageMap[sub.id] ? (
                  <Image src={subItemImageMap[sub.id]} alt="" width={28} height={28} unoptimized className="h-7 w-7 shrink-0 object-contain" />
                ) : (
                  <span className="text-base" aria-hidden>
                    {sub.emoji}
                  </span>
                )}
                <span className="leading-tight">{sub.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({
  stage,
  activeAction,
  isSick = false,
  onDragPoint,
  onDropPet,
  onSubDrop,
  onToggleAction,
  onCloseMenu,
  disabled = false
}: SidebarProps) {
  const isEgg = stage === "egg";

  return (
    <aside
      className={`fixed inset-x-0 bottom-2 z-40 flex items-end justify-center px-2 sm:inset-x-auto sm:right-2 sm:top-1/2 sm:bottom-auto sm:block sm:max-w-[6.5rem] sm:-translate-y-1/2 sm:px-0 ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <div className="flex w-full max-w-[min(100%,520px)] flex-col gap-2 sm:w-auto sm:max-w-none sm:gap-3">
      {isEgg && (
        <>
          <div className="hidden rounded-2xl border border-amber-400/50 bg-amber-100/20 p-2.5 shadow-lg shadow-amber-900/10 backdrop-blur-sm sm:block">
            <p className="mb-1.5 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide text-amber-950">
              Start here
            </p>
            <DraggablePetTool
              label="Pet"
              icon={<Hand size={22} className="text-amber-900" />}
              variant="hatch"
              onDragPoint={onDragPoint}
              onDropPet={onDropPet}
            />
            <p className="mt-2 text-center text-[9px] font-medium leading-snug text-amber-950/90">
              Drag <strong>Pet</strong> onto the egg
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/50 bg-amber-100/20 px-3 py-2 shadow-lg shadow-amber-900/10 backdrop-blur-sm sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase leading-tight tracking-wide text-amber-950">
                  Start here
                </p>
                <p className="mt-0.5 text-[9px] font-medium leading-snug text-amber-950/90">
                  Drag <strong>Pet</strong> onto the egg
                </p>
              </div>
              <DraggablePetTool
                label="Pet"
                icon={<Hand size={20} className="text-amber-900" />}
                variant="hatch"
                onDragPoint={onDragPoint}
                onDropPet={onDropPet}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-row items-end justify-center gap-2 overflow-x-auto rounded-2xl border border-white/20 bg-white/10 p-2 shadow-sm backdrop-blur-sm sm:flex-col sm:overflow-visible">
        <p className="px-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-700">
          {isEgg ? "After hatch" : "Activities"}
        </p>
        {careActions.map((item) => (
          <ActivityWithSubmenu
            key={item.action}
            action={item.action}
            label={item.label}
            icon={item.icon}
            muted={isEgg}
            isSick={isSick}
            activeAction={activeAction}
            onDragPoint={onDragPoint}
            onSubDrop={onSubDrop}
            onToggleAction={onToggleAction}
            onCloseMenu={onCloseMenu}
          />
        ))}
        {!isEgg && (
          <DraggablePetTool
            label="Pet"
            icon={<Hand size={18} />}
            variant="default"
            onDragPoint={onDragPoint}
            onDropPet={onDropPet}
          />
        )}
      </div>
      </div>
    </aside>
  );
}
