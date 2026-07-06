import React, { useState } from 'react';
import { Card, Segmented, Tag, TextField, Button, Readout } from '../components/ui';

const RunningCalculator: React.FC = () => {
    const [distance, setDistance] = useState<string>('');
    const [hours, setHours] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [seconds, setSeconds] = useState<string>('');
    const [paceMinutes, setPaceMinutes] = useState<string>('');
    const [paceSeconds, setPaceSeconds] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [mode, setMode] = useState<'calcPace' | 'calcTime'>('calcPace');

    const calculate = () => {
        const dist = parseFloat(distance);
        if (!dist || dist <= 0) return;

        if (mode === 'calcPace') {
            const h = parseFloat(hours) || 0;
            const m = parseFloat(minutes) || 0;
            const s = parseFloat(seconds) || 0;
            const totalMinutes = h * 60 + m + s / 60;

            if (totalMinutes <= 0) return;

            const pM = Math.floor(totalMinutes / dist);
            const pS = Math.round((totalMinutes / dist - pM) * 60);
            setResult(`${pM}'${pS.toString().padStart(2, '0')}" / km`);
        } else {
            const pM = parseFloat(paceMinutes) || 0;
            const pS = parseFloat(paceSeconds) || 0;
            const paceInMinutes = pM + pS / 60;

            if (paceInMinutes <= 0) return;

            const totalMinutes = paceInMinutes * dist;
            const h = Math.floor(totalMinutes / 60);
            const m = Math.floor(totalMinutes % 60);
            const s = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);

            setResult(`${h} 小時 ${m} 分 ${s} 秒`);
        }
    };

    const presetDistances = [
        { label: '5K', value: 5 },
        { label: '10K', value: 10 },
        { label: '半馬', value: 21.0975 },
        { label: '全馬', value: 42.195 },
    ];

    return (
        <Card className="max-w-lg mx-auto p-6!">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                <h2 className="text-2xl font-bold text-ink">馬拉松配速換算</h2>
                <Segmented
                    aria-label="計算模式"
                    value={mode}
                    onChange={(v) => {
                        setMode(v);
                        setResult('');
                    }}
                    options={[
                        { value: 'calcPace', label: '算配速' },
                        { value: 'calcTime', label: '算時間' },
                    ]}
                />
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">距離 (公里)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {presetDistances.map((d) => (
                            <Tag key={d.label} onClick={() => setDistance(d.value.toString())}>
                                {d.label}
                            </Tag>
                        ))}
                    </div>
                    <TextField type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="輸入距離" unit="km" />
                </div>

                {mode === 'calcPace' ? (
                    <div className="grid grid-cols-3 gap-4">
                        <TextField label="時" type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
                        <TextField label="分" type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
                        <TextField label="秒" type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="0" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <TextField label="配速 (分)" type="number" value={paceMinutes} onChange={(e) => setPaceMinutes(e.target.value)} placeholder="分/km" />
                        <TextField label="配速 (秒)" type="number" value={paceSeconds} onChange={(e) => setPaceSeconds(e.target.value)} placeholder="秒" />
                    </div>
                )}

                <Button variant="primary" block size="lg" onClick={calculate}>
                    {mode === 'calcPace' ? '計算配速' : '計算完成時間'}
                </Button>

                {result && <Readout label={mode === 'calcPace' ? '平均配速' : '完成時間'} value={result} />}
            </div>
        </Card>
    );
};

export default RunningCalculator;
