import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Card, TextField, Button, Tag } from '../components/ui';

const WeightCalculator: React.FC = () => {
    const [kg, setKg] = useState<string>('');
    const [lb, setLb] = useState<string>('');
    const [activeField, setActiveField] = useState<'kg' | 'lb'>('lb');

    const updateLbFromKg = (kgVal: string) => {
        if (kgVal === '') {
            setLb('');
        } else {
            setLb((parseFloat(kgVal) * 2.20462).toFixed(2));
        }
    };

    const updateKgFromLb = (lbVal: string) => {
        if (lbVal === '') {
            setKg('');
        } else {
            setKg((parseFloat(lbVal) / 2.20462).toFixed(2));
        }
    };

    const handleKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setKg(val);
        updateLbFromKg(val);
    };

    const handleLbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLb(val);
        updateKgFromLb(val);
    };

    const adjustWeight = (amount: number) => {
        if (activeField === 'kg') {
            const currentKg = parseFloat(kg) || 0;
            const newKg = Math.max(0, currentKg + amount).toString();
            setKg(newKg);
            updateLbFromKg(newKg);
        } else {
            const currentLb = parseFloat(lb) || 0;
            const newLb = Math.max(0, currentLb + amount).toString();
            setLb(newLb);
            updateKgFromLb(newLb);
        }
    };

    const presets = {
        kg: [10, 20, 30, 40],
        lb: [15, 20, 25, 30],
    };

    return (
        <Card className="max-w-2xl mx-auto p-6!">
            <h2 className="text-2xl font-bold mb-6 text-ink border-b border-border pb-2">磅-公斤換算</h2>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <TextField
                    label="磅 (LB)"
                    unit="lb"
                    type="number"
                    value={lb}
                    onChange={handleLbChange}
                    onFocus={() => setActiveField('lb')}
                    active={activeField === 'lb'}
                    centered
                    placeholder="0"
                    className="text-xl font-medium"
                    containerClassName="flex-1"
                />

                <div className="text-ink-subtle rotate-90 md:rotate-0">
                    <ArrowRightLeft size={32} />
                </div>

                <TextField
                    label="公斤 (KG)"
                    unit="kg"
                    type="number"
                    value={kg}
                    onChange={handleKgChange}
                    onFocus={() => setActiveField('kg')}
                    active={activeField === 'kg'}
                    centered
                    placeholder="0"
                    className="text-xl font-medium"
                    containerClassName="flex-1"
                />
            </div>

            <div className="mt-8 space-y-4">
                <div className="flex justify-center gap-4">
                    <Button variant="soft-danger" onClick={() => adjustWeight(-5)}>
                        -5 {activeField.toUpperCase()}
                    </Button>
                    <Button variant="soft-success" onClick={() => adjustWeight(5)}>
                        +5 {activeField.toUpperCase()}
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {presets[activeField].map((weight) => (
                        <Tag
                            key={weight}
                            onClick={() => {
                                const val = weight.toString();
                                if (activeField === 'kg') {
                                    setKg(val);
                                    updateLbFromKg(val);
                                } else {
                                    setLb(val);
                                    updateKgFromLb(val);
                                }
                            }}
                        >
                            快速填入 {weight}
                            {activeField}
                        </Tag>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default WeightCalculator;
