import { useState } from 'react';
import { Cloud, Droplets, Wind, Activity, CloudRain, Sun, MapPin, ThermometerSun, Search, Settings, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button, Segmented, TextField, Card, Tile, Badge, Chip, Tag, GuideCard, Notice, Readout, EmptyState, Skeleton } from '../components/ui';

function Section({ id, num, title, desc, children }: { id: string; num: string; title: string; desc: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-14 scroll-mt-6">
            <div className="flex items-baseline gap-2.5 mb-1">
                <span className="font-mono text-xs text-ink-subtle">{num}</span>
                <h2 className="text-xl font-extrabold tracking-tight text-ink">{title}</h2>
            </div>
            <p className="text-sm text-ink-muted mb-5 max-w-[62ch]">{desc}</p>
            <Card className="p-5!">{children}</Card>
        </section>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} className="block px-2.5 py-1.5 rounded-lg text-[13px] font-semibold text-ink-muted hover:bg-surface-3 hover:text-ink transition-colors">
            {children}
        </a>
    );
}

function UiKit() {
    const [seg, setSeg] = useState<'a' | 'b'>('a');
    const [tolerance, setTolerance] = useState<'heat' | 'normal' | 'cold'>('normal');
    const [minutes, setMinutes] = useState(60);
    const [favorites, setFavorites] = useState([
        { id: '1', label: '臺中市西屯區' },
        { id: '2', label: '臺北市信義區' },
    ]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8">
            <nav className="hidden lg:flex flex-col gap-0.5 sticky top-4 self-start">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-ink-subtle mb-1">Foundations</p>
                <NavLink href="#colors">語意配色</NavLink>
                <NavLink href="#type">字級</NavLink>
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-ink-subtle mt-3 mb-1">Components</p>
                <NavLink href="#buttons">按鈕</NavLink>
                <NavLink href="#segmented">分段控制</NavLink>
                <NavLink href="#fields">輸入欄</NavLink>
                <NavLink href="#tiles">數據磚</NavLink>
                <NavLink href="#badges">徽章 / 標籤 / 膠囊</NavLink>
                <NavLink href="#guides">建議卡 / 提示條</NavLink>
                <NavLink href="#states">空 / 載入態</NavLink>
                <NavLink href="#scoring-card">評分卡</NavLink>
            </nav>

            <div className="min-w-0">
                <header className="mb-10">
                    <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary font-semibold">Live Component Library</div>
                    <h1 className="text-3xl font-extrabold tracking-tight mt-1.5 mb-2 text-ink">Z-Running 統一元件庫</h1>
                    <p className="text-sm text-ink-muted max-w-[62ch]">
                        這是真實 React 元件的即時展示（非靜態 mockup），與五個頁面共用同一份 <code className="font-mono">components/ui</code>。此頁不掛在導覽選單，僅供開發參考。
                    </p>
                </header>

                <Section id="colors" num="01" title="語意配色" desc="不寫死顏色，一律走用途 token。改一個 CSS 變數，全站跟著換。">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {(
                            [
                                ['Primary', 'bg-primary'],
                                ['Success', 'bg-success'],
                                ['Warn', 'bg-warn'],
                                ['Danger', 'bg-danger'],
                                ['Info', 'bg-info'],
                                ['Accent', 'bg-accent'],
                            ] as const
                        ).map(([name, cls]) => (
                            <div key={name} className="border border-border rounded-xl overflow-hidden">
                                <div className={`h-14 ${cls}`} />
                                <div className="px-2.5 py-2 text-xs font-bold text-ink">{name}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section id="type" num="02" title="字級" desc="沿用系統字，不引入 webfont。用字重與字距建立層級。">
                    <div className="space-y-3">
                        <div className="flex items-baseline gap-4">
                            <span className="font-mono text-[10px] text-ink-subtle w-24 shrink-0">display</span>
                            <span className="text-4xl font-extrabold tracking-tight">28°C</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="font-mono text-[10px] text-ink-subtle w-24 shrink-0">heading</span>
                            <span className="text-xl font-extrabold tracking-tight">未來 24 小時可跑度</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="font-mono text-[10px] text-ink-subtle w-24 shrink-0">body</span>
                            <span className="text-sm">目前為東北風，逆風時配速可能受影響。</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="font-mono text-[10px] text-ink-subtle w-24 shrink-0">label</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">跑步狀態與評分</span>
                        </div>
                    </div>
                </Section>

                <Section id="buttons" num="03" title="按鈕" desc="語意變體 × 三種尺寸；圖示按鈕固定正方形，不受尺寸級距影響長寬比。">
                    <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-subtle mb-2.5">variants</p>
                    <div className="flex flex-wrap gap-2.5 mb-5">
                        <Button variant="primary">套用設定</Button>
                        <Button variant="secondary">取消</Button>
                        <Button variant="ghost">清除</Button>
                        <Button variant="danger">移除最愛</Button>
                        <Button variant="soft">雙打 / 單打</Button>
                        <Button variant="soft-success">+5 KG</Button>
                        <Button variant="soft-danger">-5 KG</Button>
                        <Button variant="primary" iconOnly aria-label="定位">
                            <MapPin />
                        </Button>
                        <Button variant="secondary" iconOnly aria-label="設定">
                            <Settings />
                        </Button>
                    </div>
                    <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-subtle mb-2.5">sizes</p>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button variant="primary" size="sm">
                            Small
                        </Button>
                        <Button variant="primary">Medium</Button>
                        <Button variant="primary" size="lg">
                            Large
                        </Button>
                        <Button variant="secondary" size="sm" iconOnly aria-label="sm">
                            <Search />
                        </Button>
                        <Button variant="secondary" iconOnly aria-label="md">
                            <Search />
                        </Button>
                        <Button variant="secondary" size="lg" iconOnly aria-label="lg">
                            <Search />
                        </Button>
                    </div>
                </Section>

                <Section id="segmented" num="04" title="分段控制" desc="互斥的少量選項；取代各頁各自手刻的按鈕組。">
                    <div className="flex flex-wrap gap-6">
                        <Segmented
                            aria-label="示範"
                            value={seg}
                            onChange={setSeg}
                            options={[
                                { value: 'a', label: '算配速' },
                                { value: 'b', label: '算時間' },
                            ]}
                        />
                        <Segmented
                            aria-label="體感耐受"
                            value={tolerance}
                            onChange={setTolerance}
                            options={[
                                { value: 'heat', label: '怕熱' },
                                { value: 'normal', label: '普通' },
                                { value: 'cold', label: '怕冷' },
                            ]}
                        />
                    </div>
                </Section>

                <Section id="fields" num="05" title="輸入欄" desc="帶標籤、單位後綴、active 高亮的表單欄位；搜尋列用同一元件加圖示。">
                    <div className="flex flex-wrap gap-4 items-end mb-6">
                        <TextField label="距離" unit="km" defaultValue="10" centered containerClassName="w-40" />
                        <TextField label="配速（分）" placeholder="0" centered containerClassName="w-36" />
                    </div>
                    <TextField
                        placeholder="搜尋城市／鄉鎮（例如：西屯）"
                        leadingIcon={<Search size={18} />}
                        containerClassName="max-w-sm"
                        trailing={
                            <Button variant="ghost" size="sm" iconOnly aria-label="搜尋" className="-mr-1.5">
                                <Search size={16} />
                            </Button>
                        }
                    />
                </Section>

                <Section id="tiles" num="06" title="數據磚" desc="單一指標方塊：頂部色條 + 圖示 + 數值 + 一句判讀。">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <Tile icon={Droplets} label="濕度" value={68} unit="%" hint="✓ 舒適" accent="info" />
                        <Tile icon={Wind} label="風速" value={9} unit="km/h" hint="✓ 微風" accent="success" />
                        <Tile icon={Activity} label="PM2.5" value="12.4" hint="✓ 良好" accent="accent" />
                        <Tile icon={CloudRain} label="降雨機率" value={45} unit="%" hint="☁️ 可能有雨" accent="warn" />
                        <Tile icon={Sun} label="紫外線" value={9} hint="⚠️ 過量" accent="danger" />
                    </div>
                </Section>

                <Section id="badges" num="07" title="徽章 / 標籤 / 膠囊" desc="三種各司其職：徽章唯讀狀態、標籤一鍵填值、膠囊可移除實體。">
                    <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-subtle mb-2.5">badges · 唯讀</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        <Badge variant="success">✓ 溫度佳</Badge>
                        <Badge variant="warn">⚠️ 濕度偏高</Badge>
                        <Badge variant="danger">✕ 空品不佳</Badge>
                        <Badge variant="neutral">露點 18°C</Badge>
                        <Badge variant="solid">AQI 2 · 普通</Badge>
                    </div>
                    <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-subtle mb-2.5">tags · 一鍵填值</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        <Tag>5K</Tag>
                        <Tag>10K</Tag>
                        <Tag selected>半馬</Tag>
                        <Tag>全馬</Tag>
                    </div>
                    <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-subtle mb-2.5">chips · 可移除（最愛地點）</p>
                    <div className="flex flex-wrap gap-2">
                        {favorites.map((f) => (
                            <Chip key={f.id} label={f.label} icon={MapPin} onSelect={() => {}} onRemove={() => setFavorites((prev) => prev.filter((x) => x.id !== f.id))} />
                        ))}
                        {favorites.length === 0 && <span className="text-xs text-ink-subtle">（已全部移除，重新整理可還原示範）</span>}
                    </div>
                </Section>

                <Section id="guides" num="08" title="建議卡 / 提示條 / 結果面板" desc="建議卡是左側色條的內容卡；提示條是整寬語氣橫幅；結果面板放計算輸出。">
                    <div className="grid gap-2.5 mb-5">
                        <GuideCard icon={ThermometerSun} title="穿著建議：短袖短褲" desc="體感 26°C，排汗短袖即可，不需外套。" accent="warn" />
                        <GuideCard
                            icon={Droplets}
                            title="補水建議"
                            desc="60 分鐘訓練，建議每 20 分鐘補 150ml。"
                            accent="info"
                            action={
                                <div className="flex gap-1">
                                    {[30, 60, 90].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMinutes(m)}
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${m === minutes ? 'bg-primary text-white' : 'bg-surface-3 text-ink-muted'}`}
                                        >
                                            {m}分
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                    </div>
                    <div className="grid gap-2.5 mb-5">
                        <Notice icon={Info} tone="info">
                            你的 <strong>6'00"/km</strong> → 建議 <strong>5'50"~6'10"/km</strong>。
                        </Notice>
                        <Notice icon={CheckCircle2} tone="success">
                            天氣狀況良好，享受跑步！
                        </Notice>
                        <Notice icon={AlertTriangle} tone="warn">
                            切換模式將<strong>清除目前紀錄</strong>，確定嗎？
                        </Notice>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Readout label="平均配速" value="5'42&quot; / km" className="flex-1 min-w-40" />
                        <Readout label="完成時間" value="1 小時 58 分" className="flex-1 min-w-40" />
                    </div>
                </Section>

                <Section id="states" num="09" title="空 / 載入態" desc="沒資料與載入中要一致：空態給圖示＋引導；載入用 skeleton。">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <EmptyState icon={Cloud} message="請搜尋城市或使用定位" />
                        <Card className="flex flex-col justify-center gap-3">
                            <Skeleton className="w-2/5" />
                            <Skeleton className="w-4/5 h-8" />
                            <Skeleton className="w-3/5" />
                        </Card>
                    </div>
                </Section>

                <Section id="scoring-card" num="10" title="評分卡（跑步狀態）— 新配色提案" desc="四種評分等級的漸層配色重新設計：使用對比度更高、更有活力的色彩。舊色在右側對照。">
                    <div className="grid gap-4">
                        {/* 新配色 */}
                        <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-subtle mb-1">✦ 新配色提案</p>
                        {(
                            [
                                {
                                    level: '絕佳',
                                    score: 92,
                                    color: 'from-[#047857] to-[#2dd4bf]',
                                    emoji: '🏃‍♂️💨',
                                    badge: '92',
                                    desc: '溫度・PM2.5・濕度 全部達標',
                                },
                                {
                                    level: '良好',
                                    score: 74,
                                    color: 'from-[#2563eb] to-[#60a5fa]',
                                    emoji: '🏃‍♂️',
                                    badge: '74',
                                    desc: '溫度・風速 達標',
                                },
                                {
                                    level: '尚可',
                                    score: 51,
                                    color: 'from-[#f59e0b] to-[#d97706]',
                                    emoji: '🚶‍♂️',
                                    badge: '51',
                                    desc: '濕度偏高，建議適度補水',
                                },
                                {
                                    level: '不佳',
                                    score: 28,
                                    color: 'from-[#dc2626] to-[#fb7185]',
                                    emoji: '⚠️',
                                    badge: '28',
                                    desc: 'PM2.5 過高，建議改室內訓練',
                                },
                            ] as const
                        ).map((item) => (
                            <div key={item.level} className={`bg-linear-to-r ${item.color} rounded-3xl p-5 text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-6 -mb-6" />
                                <div className="relative z-10">
                                    <p className="text-xs font-bold opacity-75 uppercase tracking-widest mb-3">跑步狀態與評分</p>
                                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                        <p className="text-5xl font-black tracking-tighter drop-shadow-md leading-none">{item.level}</p>
                                        <div className="inline-flex items-end gap-1.5 px-3 py-2 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-[16px] shadow-lg self-start">
                                            <span className="text-[11px] font-bold text-white/65 mb-1">綜合分數</span>
                                            <span className="text-4xl font-black tracking-tight leading-none text-white">{item.badge}</span>
                                            <span className="text-sm font-bold text-white/65 mb-1">/100</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-white/80">{item.desc}</p>
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <div className="rounded-xl border border-white/[18%] bg-white/10 px-3 py-2">
                                            <p className="text-[10px] font-semibold text-white/65">當前氣溫</p>
                                            <p className="text-2xl font-black leading-tight text-white">28°C</p>
                                            <p className="text-[10px] text-white/55 mt-0.5">體感 30°C・露點 22°C</p>
                                        </div>
                                        <div className="rounded-xl border border-white/[18%] bg-white/10 px-3 py-2 sm:col-span-2">
                                            <p className="text-[10px] font-semibold text-white/65">🏃 配速建議</p>
                                            <p className="text-sm font-black leading-tight mt-1">
                                                <span className="text-white/55 text-[11px] font-semibold">6'00"/km</span>
                                                <span className="mx-1.5 text-white/40">→</span>
                                                <span className="text-white text-base">6'10"~6'30"/km</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        </div>
    );
}

export default UiKit;
