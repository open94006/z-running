import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Card, TextField, Button, Tag } from '../components/ui';

const PitchingCalculator: React.FC = () => {
    const [mph, setMph] = useState<string>('');
    const [kph, setKph] = useState<string>('');
    const [activeField, setActiveField] = useState<'mph' | 'kph'>('kph');

    const updateKphFromMph = (mphVal: string) => {
        if (mphVal === '') {
            setKph('');
        } else {
            setKph((parseFloat(mphVal) * 1.60934).toFixed(1));
        }
    };

    const updateMphFromKph = (kphVal: string) => {
        if (kphVal === '') {
            setMph('');
        } else {
            setMph((parseFloat(kphVal) / 1.60934).toFixed(1));
        }
    };

    const handleMphChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMph(val);
        updateKphFromMph(val);
    };

    const handleKphChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setKph(val);
        updateMphFromKph(val);
    };

    const adjustSpeed = (amount: number) => {
        if (activeField === 'mph') {
            const current = parseFloat(mph) || 0;
            const newVal = Math.max(0, current + amount).toString();
            setMph(newVal);
            updateKphFromMph(newVal);
        } else {
            const current = parseFloat(kph) || 0;
            const newVal = Math.max(0, current + amount).toString();
            setKph(newVal);
            updateMphFromKph(newVal);
        }
    };

    const presetSpeeds = [
        { value: 145, unit: 'km/h' },
        { value: 150, unit: 'km/h' },
        { value: 155, unit: 'km/h' },
        { value: 90, unit: 'mph' },
        { value: 95, unit: 'mph' },
        { value: 100, unit: 'mph' },
    ];

    return (
        <Card className="max-w-2xl mx-auto p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-ink border-b border-border pb-2">公里-英里換算</h2>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
                <TextField
                    label="公里 (KPH)"
                    unit="km/h"
                    type="number"
                    value={kph}
                    onChange={handleKphChange}
                    onFocus={() => setActiveField('kph')}
                    active={activeField === 'kph'}
                    centered
                    placeholder="0"
                    className="text-2xl sm:text-3xl font-bold text-primary"
                    containerClassName="w-full md:flex-1 text-center"
                />

                <div className="w-full md:w-auto flex items-center justify-center text-ink-subtle shrink-0 py-1">
                    <ArrowRightLeft size={32} className="rotate-90 md:rotate-0" />
                </div>

                <TextField
                    label="英里 (MPH)"
                    unit="mph"
                    type="number"
                    value={mph}
                    onChange={handleMphChange}
                    onFocus={() => setActiveField('mph')}
                    active={activeField === 'mph'}
                    centered
                    placeholder="0"
                    className="text-2xl sm:text-3xl font-bold text-accent"
                    containerClassName="w-full md:flex-1 text-center"
                />
            </div>

            <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-center sm:gap-4">
                    <Button variant="soft" className="w-full sm:w-auto" onClick={() => adjustSpeed(-1)}>
                        -1 {activeField.toUpperCase()}
                    </Button>
                    <Button variant="soft" className="w-full sm:w-auto" onClick={() => adjustSpeed(1)}>
                        +1 {activeField.toUpperCase()}
                    </Button>
                </div>

                <div>
                    <p className="text-sm text-ink-muted mb-3 text-center">常見球速參考</p>
                    <div className="flex justify-center flex-wrap gap-2">
                        {presetSpeeds.map((preset) => {
                            const isKph = preset.unit === 'km/h';
                            return (
                                <Tag
                                    key={`${preset.value}-${preset.unit}`}
                                    onClick={() => {
                                        const val = preset.value.toString();
                                        if (isKph) {
                                            setKph(val);
                                            updateMphFromKph(val);
                                            setActiveField('kph');
                                        } else {
                                            setMph(val);
                                            updateKphFromMph(val);
                                            setActiveField('mph');
                                        }
                                    }}
                                >
                                    {preset.value} {preset.unit}
                                </Tag>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PitchingCalculator;
