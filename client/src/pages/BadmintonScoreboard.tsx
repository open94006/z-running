import React, { useState, useEffect } from "react";
import { Info, RotateCcw, Users, User, HelpCircle, Trophy } from "lucide-react";

const ShuttlecockIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 19c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" />
    <path d="M12 9V3" />
    <path d="M9 10l-2-5" />
    <path d="M15 10l2-5" />
    <path d="M12 19v2" />
  </svg>
);

import clsx from "clsx";
import { useAlert } from "../components/AlertContext";
import { Button, Card, Modal, Notice, TextField } from "../components/ui";

type Team = "Red" | "Blue";

interface MatchState {
  scoreRed: number;
  scoreBlue: number;
  setsRed: number;
  setsBlue: number;
  servingTeam: Team;
  isDoubles: boolean;
  positions: {
    Red: { right: string; left: string };
    Blue: { right: string; left: string };
  };
}

interface PersistentState extends MatchState {
  timestamp: number;
  history: MatchState[];
}

const STORAGE_KEY = "badminton_scoreboard_state";
const EXPIRATION_MS = 60 * 60 * 1000; // 1小時

// 輔助函式：載入初始狀態 (在元件外部定義)
const getInitialState = () => {
  const defaultState = {
    scoreRed: 0,
    scoreBlue: 0,
    setsRed: 0,
    setsBlue: 0,
    servingTeam: "Red" as Team,
    isDoubles: true,
    positions: {
      Red: { right: "A1", left: "A2" },
      Blue: { right: "B1", left: "B2" },
    },
    history: [] as MatchState[],
  };

  if (typeof window === "undefined") return defaultState;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data: PersistentState = JSON.parse(saved);
      const now = Date.now();
      if (now - data.timestamp < EXPIRATION_MS) {
        return {
          scoreRed: data.scoreRed,
          scoreBlue: data.scoreBlue,
          setsRed: data.setsRed,
          setsBlue: data.setsBlue,
          servingTeam: data.servingTeam,
          isDoubles: data.isDoubles,
          positions: data.positions,
          history: data.history || [],
        };
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to parse saved state", e);
    }
  }
  return defaultState;
};

const BadmintonScoreboard: React.FC = () => {
  const { showConfirm, showAlert } = useAlert();

  // 使用延遲初始化函數，只在第一次渲染時執行
  const [initial] = useState(() => getInitialState());

  // 狀態定義
  const [scoreRed, setScoreRed] = useState(initial.scoreRed);
  const [scoreBlue, setScoreBlue] = useState(initial.scoreBlue);
  const [setsRed, setSetsRed] = useState(initial.setsRed);
  const [setsBlue, setSetsBlue] = useState(initial.setsBlue);
  const [servingTeam, setServingTeam] = useState<Team>(initial.servingTeam);
  const [isDoubles, setIsDoubles] = useState(initial.isDoubles);
  const [showRules, setShowRules] = useState(false);
  const [history, setHistory] = useState<MatchState[]>(initial.history);
  const [positions, setPositions] = useState(initial.positions);
  const [editingPlayer, setEditingPlayer] = useState<{
    team: Team;
    pos: "right" | "left";
  } | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState("");

  // 當狀態改變時儲存到 LocalStorage
  useEffect(() => {
    const stateToSave: PersistentState = {
      scoreRed,
      scoreBlue,
      setsRed,
      setsBlue,
      servingTeam,
      isDoubles,
      positions,
      history,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    scoreRed,
    scoreBlue,
    setsRed,
    setsBlue,
    servingTeam,
    isDoubles,
    positions,
    history,
  ]);

  // 計算目前的發球員（衍生狀態）
  const currentServer = isDoubles
    ? servingTeam === "Red"
      ? scoreRed % 2 === 0
        ? positions.Red.right
        : positions.Red.left
      : scoreBlue % 2 === 0
      ? positions.Blue.right
      : positions.Blue.left
    : servingTeam === "Red"
    ? "A"
    : "B";

  const getServerPosition = (score: number) => (score % 2 === 0 ? "右" : "左");

  const checkSetWinner = (sRed: number, sBlue: number): Team | null => {
    if (sRed >= 30) return "Red";
    if (sBlue >= 30) return "Blue";
    if (sRed >= 21 && sRed - sBlue >= 2) return "Red";
    if (sBlue >= 21 && sBlue - sRed >= 2) return "Blue";
    return null;
  };

  const handleSetWin = (winner: Team) => {
    setTimeout(() => {
      if (winner === "Red") {
        const newSets = setsRed + 1;
        setSetsRed(newSets);
        if (newSets >= 2) {
          showConfirm({
            title: "比賽結束",
            message: "紅方獲勝！要開始新的比賽嗎？",
            confirmLabel: "開始新比賽",
            type: "info",
            onConfirm: fullReset,
          });
        } else {
          showConfirm({
            title: "本局結束",
            message: "紅方贏得此局！是否開始下一局？",
            confirmLabel: "下一局",
            type: "info",
            onConfirm: nextSet,
          });
        }
      } else {
        const newSets = setsBlue + 1;
        setSetsBlue(newSets);
        if (newSets >= 2) {
          showConfirm({
            title: "比賽結束",
            message: "藍方獲勝！要開始新的比賽嗎？",
            confirmLabel: "開始新比賽",
            type: "info",
            onConfirm: fullReset,
          });
        } else {
          showConfirm({
            title: "本局結束",
            message: "藍方贏得此局！是否開始下一局？",
            confirmLabel: "下一局",
            type: "info",
            onConfirm: nextSet,
          });
        }
      }
    }, 100);
  };

  const nextSet = () => {
    setScoreRed(0);
    setScoreBlue(0);
    setPositions({
      Red: { right: "A1", left: "A2" },
      Blue: { right: "B1", left: "B2" },
    });
    setHistory([]);
    showAlert("已開始下一局", "success");
  };

  const fullReset = () => {
    setScoreRed(0);
    setScoreBlue(0);
    setSetsRed(0);
    setSetsBlue(0);
    setServingTeam("Red");
    setPositions({
      Red: { right: "A1", left: "A2" },
      Blue: { right: "B1", left: "B2" },
    });
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    showAlert("比賽已重置", "success");
  };

  const updateScore = (winner: Team) => {
    const currentState: MatchState = {
      scoreRed,
      scoreBlue,
      setsRed,
      setsBlue,
      servingTeam,
      isDoubles,
      positions: JSON.parse(JSON.stringify(positions)),
    };
    setHistory([...history, currentState]);

    let newScoreRed = scoreRed;
    let newScoreBlue = scoreBlue;

    if (winner === "Red") {
      newScoreRed = scoreRed + 1;
      setScoreRed(newScoreRed);
      if (servingTeam === "Red") {
        if (isDoubles) {
          setPositions((prev) => ({
            ...prev,
            Red: { right: prev.Red.left, left: prev.Red.right },
          }));
        }
      } else {
        setServingTeam("Red");
      }
    } else {
      newScoreBlue = scoreBlue + 1;
      setScoreBlue(newScoreBlue);
      if (servingTeam === "Blue") {
        if (isDoubles) {
          setPositions((prev) => ({
            ...prev,
            Blue: { right: prev.Blue.left, left: prev.Blue.right },
          }));
        }
      } else {
        setServingTeam("Blue");
      }
    }

    const setWinner = checkSetWinner(newScoreRed, newScoreBlue);
    if (setWinner) {
      handleSetWin(setWinner);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setScoreRed(lastState.scoreRed);
    setScoreBlue(lastState.scoreBlue);
    setSetsRed(lastState.setsRed);
    setSetsBlue(lastState.setsBlue);
    setServingTeam(lastState.servingTeam);
    setIsDoubles(lastState.isDoubles);
    setPositions(lastState.positions);
    setHistory(history.slice(0, -1));
    showAlert("已撤銷上一球", "info");
  };

  const toggleMode = () => {
    const switchMode = () => {
      setIsDoubles(!isDoubles);
      fullReset();
      showAlert(`已切換為${!isDoubles ? "雙打" : "單打"}模式`, "success");
    };

    if (history.length > 0) {
      showConfirm({
        title: "切換模式",
        message: "切換模式將清除目前紀錄，確定嗎？",
        confirmLabel: "確定切換",
        type: "warning",
        onConfirm: switchMode,
      });
    } else {
      switchMode();
    }
  };

  const startEditing = (team: Team, pos: "right" | "left") => {
    setEditingPlayer({ team, pos });
    setTempPlayerName(positions[team][pos]);
  };

  const savePlayerName = () => {
    if (editingPlayer) {
      const { team, pos } = editingPlayer;
      const newName =
        tempPlayerName.trim() ||
        (team === "Red"
          ? pos === "right"
            ? "A1"
            : "A2"
          : pos === "right"
          ? "B1"
          : "B2");
      setPositions((prev) => ({
        ...prev,
        [team]: {
          ...prev[team],
          [pos]: newName,
        },
      }));
      setEditingPlayer(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 md:gap-4 p-1 md:p-4 max-w-4xl mx-auto h-full overflow-hidden bg-app">
      {/* 頂部控制欄 */}
      <Card className="w-full flex justify-between items-center px-3 py-1 md:py-3 rounded-xl!">
        <div className="flex space-x-2 items-center">
          <Button variant="soft" size="sm" onClick={toggleMode} className="text-[10px] md:text-sm gap-1">
            {isDoubles ? <Users size={14} /> : <User size={14} />}
            <span>{isDoubles ? "雙打" : "單打"}</span>
          </Button>

          <div className="flex items-center space-x-1.5 ml-2 md:ml-4 bg-surface-3 px-1.5 py-0.5 rounded-md">
            <span className="text-[10px] md:text-sm font-bold text-ink-muted">
              局數
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-red-600 dark:text-red-500 font-black text-xs md:text-lg">
                {setsRed}
              </span>
              <span className="text-ink-subtle text-[10px]">-</span>
              <span className="text-blue-600 dark:text-blue-500 font-black text-xs md:text-lg">
                {setsBlue}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="重置比賽"
            onClick={() => {
              showConfirm({
                title: "重置比賽",
                message: "確定要重置整場比賽嗎？比分將歸零。",
                confirmLabel: "重置",
                type: "danger",
                onConfirm: fullReset,
              });
            }}
          >
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="sm" iconOnly aria-label="規則說明" onClick={() => setShowRules(true)}>
            <HelpCircle />
          </Button>
        </div>
      </Card>

      {/* 記分板區域 */}
      <div className="grid grid-cols-2 gap-1.5 md:gap-4 w-full flex-1 min-h-0">
        {/* 紅方 */}
        <div
          className={clsx(
            "relative flex flex-col items-center justify-center p-1 md:p-4 rounded-lg md:rounded-3xl shadow-sm md:shadow-xl transition-all duration-300 border md:border-4 h-full",
            servingTeam === "Red"
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-transparent bg-surface"
          )}
        >
          {servingTeam === "Red" && (
            <div className="absolute top-0.5 right-0.5 md:top-4 md:right-4 animate-bounce">
              <span className="bg-red-500 dark:bg-red-600 text-white px-1 py-0.5 rounded-full text-[6px] md:text-xs font-bold shadow-sm">
                發球
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1 mb-0.5 md:mb-2 text-center">
            <ShuttlecockIcon size={12} className="text-red-500 md:w-5 md:h-5" />
            <h2 className="text-[9px] md:text-xl font-bold text-red-600 dark:text-red-400">
              紅方 (A)
            </h2>
            {setsRed > 0 && (
              <div className="flex space-x-0.5">
                {[...Array(setsRed)].map((_, i) => (
                  <Trophy
                    key={i}
                    className="w-2.5 h-2.5 md:w-5 md:h-5 text-yellow-500 dark:text-white fill-current"
                  />
                ))}
              </div>
            )}
          </div>

          <div
            onClick={() => updateScore("Red")}
            className="text-4xl md:text-8xl font-black text-ink cursor-pointer select-none active:scale-95 transition-transform leading-none"
          >
            {scoreRed}
          </div>
          <div className="mt-1.5 md:mt-6 grid grid-cols-2 gap-1 md:gap-3 w-full text-center px-1">
            <div
              onClick={() => isDoubles && startEditing("Red", "left")}
              className={clsx(
                "p-0.5 md:p-2 rounded border transition-all duration-300",
                isDoubles ? "cursor-pointer hover:border-red-300" : "",
                isDoubles &&
                  currentServer === positions.Red.left &&
                  servingTeam === "Red"
                  ? "bg-red-500 dark:bg-red-600 text-white border-red-500 dark:border-red-600 shadow-sm"
                  : "bg-surface-3 border-transparent text-ink"
              )}
            >
              <div className="text-[6px] md:text-xs opacity-70">左</div>
              <div className="text-[8px] md:text-base font-bold truncate">
                {isDoubles ? positions.Red.left : "A"}
              </div>
            </div>
            <div
              onClick={() => isDoubles && startEditing("Red", "right")}
              className={clsx(
                "p-0.5 md:p-2 rounded border transition-all duration-300",
                isDoubles ? "cursor-pointer hover:border-red-300" : "",
                isDoubles &&
                  currentServer === positions.Red.right &&
                  servingTeam === "Red"
                  ? "bg-red-500 dark:bg-red-600 text-white border-red-500 dark:border-red-600 shadow-sm"
                  : "bg-surface-3 border-transparent text-ink"
              )}
            >
              <div className="text-[6px] md:text-xs opacity-70">右</div>
              <div className="text-[8px] md:text-base font-bold truncate">
                {isDoubles ? positions.Red.right : "A"}
              </div>
            </div>
          </div>
        </div>

        {/* 藍方 */}
        <div
          className={clsx(
            "relative flex flex-col items-center justify-center p-1 md:p-4 rounded-lg md:rounded-3xl shadow-sm md:shadow-xl transition-all duration-300 border md:border-4 h-full",
            servingTeam === "Blue"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-transparent bg-surface"
          )}
        >
          {servingTeam === "Blue" && (
            <div className="absolute top-0.5 right-0.5 md:top-4 md:right-4 animate-bounce">
              <span className="bg-blue-500 dark:bg-blue-600 text-white px-1 py-0.5 rounded-full text-[6px] md:text-xs font-bold shadow-sm">
                發球
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1 mb-0.5 md:mb-2 text-center">
            <ShuttlecockIcon
              size={12}
              className="text-blue-500 md:w-5 md:h-5"
            />
            <h2 className="text-[9px] md:text-xl font-bold text-blue-600 dark:text-blue-400">
              藍方 (B)
            </h2>
            {setsBlue > 0 && (
              <div className="flex space-x-0.5">
                {[...Array(setsBlue)].map((_, i) => (
                  <Trophy
                    key={i}
                    className="w-2.5 h-2.5 md:w-5 md:h-5 text-yellow-500 dark:text-white fill-current"
                  />
                ))}
              </div>
            )}
          </div>
          <div
            onClick={() => updateScore("Blue")}
            className="text-4xl md:text-8xl font-black text-ink cursor-pointer select-none active:scale-95 transition-transform leading-none"
          >
            {scoreBlue}
          </div>
          <div className="mt-1.5 md:mt-6 grid grid-cols-2 gap-1 md:gap-3 w-full text-center px-1">
            <div
              onClick={() => isDoubles && startEditing("Blue", "left")}
              className={clsx(
                "p-0.5 md:p-2 rounded border transition-all duration-300",
                isDoubles ? "cursor-pointer hover:border-blue-300" : "",
                isDoubles &&
                  currentServer === positions.Blue.left &&
                  servingTeam === "Blue"
                  ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600 shadow-sm"
                  : "bg-surface-3 border-transparent text-ink"
              )}
            >
              <div className="text-[6px] md:text-xs opacity-70">左</div>
              <div className="text-[8px] md:text-base font-bold truncate">
                {isDoubles ? positions.Blue.left : "B"}
              </div>
            </div>
            <div
              onClick={() => isDoubles && startEditing("Blue", "right")}
              className={clsx(
                "p-0.5 md:p-2 rounded border transition-all duration-300",
                isDoubles ? "cursor-pointer hover:border-blue-300" : "",
                isDoubles &&
                  currentServer === positions.Blue.right &&
                  servingTeam === "Blue"
                  ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600 shadow-sm"
                  : "bg-surface-3 border-transparent text-ink"
              )}
            >
              <div className="text-[6px] md:text-xs opacity-70">右</div>
              <div className="text-[8px] md:text-base font-bold truncate">
                {isDoubles ? positions.Blue.right : "B"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 狀態提示 */}
      <Notice icon={Info} tone="info" className="w-full py-1.5 md:py-2.5">
        <p className="font-bold text-[9px] md:text-sm">
          發球：
          <span className="text-blue-600 dark:text-blue-400">
            {currentServer}
          </span>
          <span className="mx-1">
            ({getServerPosition(servingTeam === "Red" ? scoreRed : scoreBlue)}
            側)
          </span>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="ml-2 md:ml-4 text-ink-subtle hover:text-primary disabled:opacity-30 transition-colors underline font-bold"
          >
            上一步
          </button>
        </p>
      </Notice>

      {/* 編輯球員名稱彈窗 */}
      {editingPlayer && (
        <Modal onClose={() => setEditingPlayer(null)} maxWidth="max-w-sm" zIndex={70}>
          <h3 className="text-xl font-bold mb-4 text-ink">編輯球員名稱</h3>
          <div className="space-y-4">
            <TextField
              label={`請輸入名稱 (${editingPlayer.team === "Red" ? "紅方" : "藍方"} - ${editingPlayer.pos === "right" ? "右側" : "左側"})`}
              value={tempPlayerName}
              onChange={(e) => setTempPlayerName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") savePlayerName();
                if (e.key === "Escape") setEditingPlayer(null);
              }}
            />
            <div className="flex space-x-3 pt-2">
              <Button variant="secondary" block onClick={() => setEditingPlayer(null)}>
                取消
              </Button>
              <Button variant="primary" block onClick={savePlayerName}>
                儲存
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 規則彈窗 */}
      {showRules && (
        <Modal onClose={() => setShowRules(false)} maxWidth="max-w-2xl" zIndex={60} className="max-h-[90vh] overflow-y-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-border pb-3 md:pb-4">
            <h3 className="text-lg md:text-2xl font-bold text-ink flex items-center">
              <Info className="mr-2 text-primary" /> 羽球規則快速查閱
            </h3>
            <Button variant="ghost" iconOnly aria-label="關閉" onClick={() => setShowRules(false)}>
              ✕
            </Button>
          </div>

          <div className="space-y-4 md:space-y-6 text-sm md:text-base text-ink-muted">
            <section>
              <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">
                一、基本規則
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>三局兩勝制</strong>，先得 21 分者獲勝。
                </li>
                <li>
                  <strong>每球得分制</strong>，贏球即得 1 分。
                </li>
                <li>
                  <strong>20:20 平手</strong>時，需連得 2 分獲勝，最高 30 分。
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">
                二、發球站位 (重要邏輯)
              </h4>
              <div className="bg-surface-2 p-3 rounded-lg border border-border">
                <p className="font-bold mb-2 text-xs md:text-sm">
                  看發球方該隊分數：
                </p>
                <ul className="list-none space-y-2 text-xs md:text-sm">
                  <li className="flex items-center">
                    <span className="w-12 md:w-16 px-1 md:px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-center font-bold mr-3 border border-green-200 dark:border-green-800">
                      偶數
                    </span>
                    站在{" "}
                    <strong className="text-green-600 dark:text-green-400 mx-1">
                      右發球區
                    </strong>{" "}
                    發球
                  </li>
                  <li className="flex items-center">
                    <span className="w-12 md:w-16 px-1 md:px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded text-center font-bold mr-3 border border-orange-200 dark:border-orange-800">
                      奇數
                    </span>
                    站在{" "}
                    <strong className="text-orange-600 dark:text-orange-400 mx-1">
                      左發球區
                    </strong>{" "}
                    發球
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">
                三、球拍與發球規定
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>擊球點</strong>：發球瞬間，擊球點必須低於發球者的
                  <strong>最低一根肋骨</strong>。
                </li>
                <li>
                  <strong>球拍指向</strong>：發球瞬間，球拍桿必須
                  <strong>指向下方</strong>。
                </li>
                <li>
                  <strong>連續動作</strong>：發球動作必須一次性且
                  <strong>連續</strong>，不可有假動作或停頓。
                </li>
                <li>
                  <strong>雙腳位置</strong>：發球與接發球時，雙腳必須
                  <strong>同時踩在地面</strong>且不可踩線。
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-bold text-primary border-b border-border pb-1 mb-2">
                四、網子與違例規則
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>觸網違例</strong>：比賽進行中，球拍、身體或衣服
                  <strong>不可觸碰網子</strong>、網繩或網柱。
                </li>
                <li>
                  <strong>過網擊球</strong>：不可在球<strong>尚未過網</strong>
                  前，將球拍伸過網擊球。
                </li>
                <li>
                  <strong>侵入場地</strong>
                  ：球拍或身體不可從網下侵入對方場地干擾對手。
                </li>
              </ul>
            </section>

            <Notice icon={Info} tone="info">
              <p className="font-bold mb-1">💡 快速記憶口訣：</p>
              <p className="italic">
                「看分數、分奇偶、右偶左奇」、「單打走內、雙打走外」、「雙打一隊一次發球權」
              </p>
            </Notice>
          </div>

          <Button variant="primary" block size="lg" className="mt-6 md:mt-8" onClick={() => setShowRules(false)}>
            了解，開始比賽
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default BadmintonScoreboard;
