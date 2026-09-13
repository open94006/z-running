import { useState, useEffect } from 'react';
import { useAlert } from '../components/AlertContext';
import { Search, MapPin, Wind, Droplets, Cloud, Activity, ThermometerSun, CloudRain, Gauge, Heart, Settings, Sun, Clock, Check, Footprints, Sunrise, Star } from 'lucide-react';
import { formatPace, getHeatStressLevel, getRunningCondition, getTrainingPaces, PM25_BREAKPOINTS, pickBestSlotIndex, type RunnerTolerance } from '../lib/runningCondition';
import { getSunTimes } from '../lib/sunTimes';
import { getClothingAdvice, getCompassDirection, getHydrationAdvice } from '../lib/runnerAdvice';
import { Button, Card, Chip, EmptyState, GuideCard, Modal, Segmented, Skeleton, ScrollPicker, TextField, Tile } from '../components/ui';

interface WeatherData {
    location: string;
    city?: string; // 縣市
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    windDeg?: number;
    icon: string;
    feelsLike: number;
    pressure: number;
    visibility: number;
    precipitationProbability?: number;
    uvIndex?: number;
    uvLevel?: string;
    temperatureTrend6h?: Array<{
        time: string;
        temperature: number;
        icon: string;
        description: string;
        humidity?: number;
        windSpeed?: number;
        feelsLike?: number;
        precipitationProbability?: number;
    }>;
    timestamp: string;
    source?: string; // 資料來源
    airQuality?: {
        aqi: number;
        description: string;
        components: {
            co: number;
            no: number;
            no2: number;
            o3: number;
            so2: number;
            pm2_5: number;
            pm10: number;
            nh3: number;
        };
    };
}

interface LocationSuggestion {
    name: string;
    state?: string;
    country?: string;
    lat: number;
    lon: number;
}

interface ConfirmedLocation {
    district: string;
    city?: string;
}

interface RunnerProfile {
    targetPaceSecPerKm: number | null;
    targetDistanceKm: number;
    tolerance: RunnerTolerance;
}

const TARGET_DISTANCES = [
    { value: '5', label: '5K' },
    { value: '10', label: '10K' },
    { value: '21.0975', label: '半馬' },
    { value: '42.195', label: '全馬' },
] as const;

interface FavoriteLocation {
    id: string;
    district: string;
    city?: string;
    lat: number;
    lon: number;
    addedAt: number;
}

// 五級空品／可跑度色階圖例——已移除

const minuteItems = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'));
const secondItems = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const RUNNER_PROFILE_STORAGE_KEY = 'weather_runner_profile_v1';
const DEFAULT_RUNNER_PROFILE: RunnerProfile = { targetPaceSecPerKm: null, targetDistanceKm: 10, tolerance: 'normal' };

const getRandomIntInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomLoadingSkeletonCount = () => {
    if (typeof window === 'undefined') return 6;

    const isMobile = window.innerWidth < 768;
    return isMobile ? getRandomIntInRange(3, 5) : getRandomIntInRange(6, 9);
};

function WeatherChecker() {
    const AUTO_SELECT_SECONDS = 7;
    const FAVORITES_STORAGE_KEY = 'weather_favorite_locations_v1';
    const FAVORITES_LIMIT = 10;
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [lastQueryCoords, setLastQueryCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingSkeletonCount, setLoadingSkeletonCount] = useState(() => getRandomLoadingSkeletonCount());
    const [locationOptions, setLocationOptions] = useState<LocationSuggestion[]>([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [confirmedLocation, setConfirmedLocation] = useState<ConfirmedLocation | null>(null);
    const [autoSelectRemaining, setAutoSelectRemaining] = useState(AUTO_SELECT_SECONDS);
    const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
        try {
            const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (!raw) return [];

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];

            return parsed
                .filter((item) => item && typeof item.id === 'string' && typeof item.district === 'string' && typeof item.lat === 'number' && typeof item.lon === 'number')
                .slice(0, FAVORITES_LIMIT);
        } catch (error) {
            console.warn('最愛地點初始化讀取失敗，已忽略:', error);
            return [];
        }
    });
    const [plannedDurationMinutes, setPlannedDurationMinutes] = useState(60);
    const [runnerProfile, setRunnerProfile] = useState<RunnerProfile>(() => {
        try {
            const raw = localStorage.getItem(RUNNER_PROFILE_STORAGE_KEY);
            if (!raw) return DEFAULT_RUNNER_PROFILE;

            const parsed = JSON.parse(raw);
            const targetPaceSecPerKm = typeof parsed?.targetPaceSecPerKm === 'number' && parsed.targetPaceSecPerKm > 0 ? parsed.targetPaceSecPerKm : null;
            const tolerance: RunnerTolerance = parsed?.tolerance === 'heat' || parsed?.tolerance === 'cold' ? parsed.tolerance : 'normal';
            const targetDistanceKm = TARGET_DISTANCES.some((d) => Number(d.value) === parsed?.targetDistanceKm) ? parsed.targetDistanceKm : DEFAULT_RUNNER_PROFILE.targetDistanceKm;
            return { targetPaceSecPerKm, targetDistanceKm, tolerance };
        } catch (error) {
            console.warn('跑者設定初始化讀取失敗，已忽略:', error);
            return DEFAULT_RUNNER_PROFILE;
        }
    });
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [showPaceModal, setShowPaceModal] = useState(false);
    const [targetPaceMinutesInput, setTargetPaceMinutesInput] = useState(() => {
        if (!runnerProfile.targetPaceSecPerKm) return '06';
        return String(Math.max(1, Math.min(20, Math.floor(runnerProfile.targetPaceSecPerKm / 60)))).padStart(2, '0');
    });
    const [targetPaceSecondsInput, setTargetPaceSecondsInput] = useState(() => {
        if (!runnerProfile.targetPaceSecPerKm) return '00';
        return String(runnerProfile.targetPaceSecPerKm % 60).padStart(2, '0');
    });
    const { showAlert } = useAlert();

    useEffect(() => {
        handleGetCurrentLocation();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.warn('最愛地點儲存失敗:', error);
        }
    }, [favorites]);

    useEffect(() => {
        try {
            localStorage.setItem(RUNNER_PROFILE_STORAGE_KEY, JSON.stringify(runnerProfile));
        } catch (error) {
            console.warn('跑者設定儲存失敗:', error);
        }
    }, [runnerProfile]);

    useEffect(() => {
        if (loading) {
            setLoadingSkeletonCount(getRandomLoadingSkeletonCount());
        }
    }, [loading]);

    const normalizeTaiwanText = (text: string) => text.trim().replace(/台/g, '臺');

    const rankLocationOptions = (list: LocationSuggestion[], query: string) => {
        const normalizedQuery = normalizeTaiwanText(query);
        const normalizeStateBase = (state?: string) => {
            const normalized = normalizeTaiwanText(state || '').trim();
            if (!normalized) return '';
            if (/^(臺灣|台灣|TW)$/i.test(normalized)) return '';
            return normalized.replace(/[縣市]$/, '');
        };

        const normalizeDistrictBase = (name: string) => {
            return normalizeTaiwanText(name || '')
                .trim()
                .replace(/區$/, '');
        };

        const score = (item: LocationSuggestion) => {
            const name = normalizeTaiwanText(item.name || '');
            const state = normalizeTaiwanText(item.state || '');
            const full = `${state}${name}`;

            if (name === normalizedQuery || full === normalizedQuery) return 4;
            if (name.startsWith(normalizedQuery)) return 3;
            if (full.includes(normalizedQuery) || name.includes(normalizedQuery)) return 2;
            return 1;
        };

        // 先排序，再去重：保留最前面的候選
        const sorted = [...list].sort((a, b) => score(b) - score(a));
        const deduped: LocationSuggestion[] = [];

        for (const item of sorted) {
            const currentDistrictBase = normalizeDistrictBase(item.name || '');
            const currentStateBase = normalizeStateBase(item.state);
            const currentCountry = (item.country || '').toUpperCase();

            const duplicated = deduped.some((existing) => {
                const existingDistrictBase = normalizeDistrictBase(existing.name || '');
                const existingStateBase = normalizeStateBase(existing.state);
                const existingCountry = (existing.country || '').toUpperCase();

                if (existingCountry !== currentCountry) return false;
                if (existingDistrictBase !== currentDistrictBase) return false;

                // 同縣市，或其中一筆只有「台灣」等模糊層級時，視為同一筆
                if (!existingStateBase || !currentStateBase) return true;
                return existingStateBase === currentStateBase;
            });

            if (!duplicated) {
                deduped.push(item);
            }
        }

        return deduped;
    };

    // 處理搜尋輸入
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCity(e.target.value);
        setConfirmedLocation(null);
    };

    const fetchTaiwanLocations = async (keyword: string): Promise<LocationSuggestion[]> => {
        const response = await fetch(`/api/weather/search?q=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '搜尋失敗');
        }

        if (!Array.isArray(data)) return [];

        return data.filter((item): item is LocationSuggestion => item && item.country === 'TW' && typeof item.name === 'string' && typeof item.lat === 'number' && typeof item.lon === 'number');
    };

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const keyword = city.trim();
        if (!keyword) return;

        setShowLocationModal(false);
        setLocationOptions([]);
        setLoading(true);

        try {
            const locations = await fetchTaiwanLocations(keyword);
            const ranked = rankLocationOptions(locations, keyword);

            if (ranked.length === 0) {
                showAlert('找不到符合的台灣鄉鎮市區', 'warning');
                return;
            }

            if (ranked.length === 1) {
                const target = ranked[0];
                await fetchWeather(`/api/weather/coordinates?lat=${target.lat}&lon=${target.lon}`, {
                    district: normalizeTaiwanText(target.name),
                    city: target.state ? normalizeTaiwanText(target.state) : undefined,
                });
                return;
            }

            setLocationOptions(ranked);
            setShowLocationModal(true);
        } catch (error) {
            console.error('搜尋地點錯誤:', error);
            showAlert('搜尋地點失敗，請稍後再試', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = async (suggestion: LocationSuggestion) => {
        const selected: ConfirmedLocation = {
            district: normalizeTaiwanText(suggestion.name),
            city: suggestion.state ? normalizeTaiwanText(suggestion.state) : undefined,
        };
        setCity(selected.district);
        setConfirmedLocation(selected);
        setShowLocationModal(false);
        setLocationOptions([]);
        await fetchWeather(`/api/weather/coordinates?lat=${suggestion.lat}&lon=${suggestion.lon}`, selected);
    };

    useEffect(() => {
        if (!showLocationModal || locationOptions.length <= 1) return;

        setAutoSelectRemaining(AUTO_SELECT_SECONDS);

        const startedAt = Date.now();
        const intervalId = window.setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
            const remainingSeconds = Math.max(0, AUTO_SELECT_SECONDS - elapsedSeconds);
            setAutoSelectRemaining(remainingSeconds);
        }, 250);

        const timeoutId = window.setTimeout(() => {
            void handleLocationSelect(locationOptions[0]);
        }, AUTO_SELECT_SECONDS * 1000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [showLocationModal, locationOptions]);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            showAlert('您的瀏覽器不支援定位功能', 'error');
            return;
        }

        setConfirmedLocation(null);
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await fetchWeather(`/api/weather/coordinates?lat=${latitude}&lon=${longitude}`);
            },
            (error) => {
                setLoading(false);
                console.error('定位錯誤:', error);
            },
        );
    };

    const fetchWeather = async (url: string, confirmed?: ConfirmedLocation) => {
        setLoading(true);
        try {
            const parsedUrl = new URL(url, window.location.origin);
            const latParam = parsedUrl.searchParams.get('lat');
            const lonParam = parsedUrl.searchParams.get('lon');

            if (latParam && lonParam) {
                const lat = Number(latParam);
                const lon = Number(lonParam);
                if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                    setLastQueryCoords({ lat, lon });
                }
            } else {
                setLastQueryCoords(null);
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                showAlert(data.message || '查詢失敗', 'error');
                setWeather(null);
                return;
            }

            const normalizedData = {
                ...data,
                location: data.location ? normalizeTaiwanText(data.location) : data.location,
                city: data.city ? normalizeTaiwanText(data.city) : data.city,
            };

            if (confirmed) {
                normalizedData.location = confirmed.district;
                normalizedData.city = confirmed.city;
                setConfirmedLocation(confirmed);
                setCity(confirmed.district);
            } else {
                setConfirmedLocation(null);
                if (normalizedData.location) setCity(normalizedData.location);
            }

            setWeather(normalizedData);
        } catch (error) {
            console.error('天氣查詢錯誤:', error);
            showAlert('無法連接到伺服器', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIconUrl = (iconCode: string) => {
        return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    };

    const getTrendIconCode = (iconCode: string, isoTime: string) => {
        const hour = new Date(isoTime).getHours();
        const isNight = hour >= 18 || hour < 6;
        if (isNight && /d$/.test(iconCode)) {
            return iconCode.replace(/d$/, 'n');
        }
        return iconCode;
    };

    const getAqiColor = (aqi: number) => {
        switch (aqi) {
            case 1:
                return 'bg-aqi-1 text-aqi-ink';
            case 2:
                return 'bg-aqi-2 text-aqi-ink';
            case 3:
                return 'bg-aqi-3 text-aqi-ink';
            case 4:
                return 'bg-aqi-4 text-aqi-ink';
            case 5:
                return 'bg-aqi-5 text-aqi-ink';
            default:
                return 'bg-aqi-0 text-aqi-ink';
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatHourMinute = (isoString: string) => {
        const hour = new Date(isoString).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        // 強制用整點格式顯示（例如 14:00）
        return hour.replace(/:\d{2}$/, ':00');
    };

    const getDisplayLocation = (data: WeatherData) => {
        const location = normalizeTaiwanText(data.location || '').trim();
        const city = normalizeTaiwanText(data.city || '').trim();
        const taiwanCityPrefixes = [
            '臺北市',
            '新北市',
            '桃園市',
            '臺中市',
            '臺南市',
            '高雄市',
            '基隆市',
            '新竹市',
            '嘉義市',
            '宜蘭縣',
            '新竹縣',
            '苗栗縣',
            '彰化縣',
            '南投縣',
            '雲林縣',
            '嘉義縣',
            '屏東縣',
            '花蓮縣',
            '臺東縣',
            '澎湖縣',
            '金門縣',
            '連江縣',
        ];

        if (city) {
            if (location.startsWith(city) && location.length > city.length) {
                return {
                    title: location.slice(city.length), // 鄉鎮市區
                    subtitle: city, // 縣市
                };
            }

            // 沒有鄉鎮區時，標題顯示縣市
            return {
                title: city,
                subtitle: '',
            };
        }

        // 若後端已把「縣市+鄉鎮」合併到 location，這裡嘗試拆解
        for (const prefix of taiwanCityPrefixes) {
            if (location.startsWith(prefix) && location.length > prefix.length) {
                return {
                    title: location.slice(prefix.length),
                    subtitle: prefix,
                };
            }
        }

        return {
            title: location,
            subtitle: '',
        };
    };

    const runningCondition = weather
        ? getRunningCondition(weather.temperature, weather.airQuality?.aqi, weather.airQuality?.components.pm2_5, weather.humidity, weather.windSpeed, runnerProfile.tolerance)
        : null;
    const locationDisplay = weather ? (confirmedLocation ? { title: confirmedLocation.district, subtitle: confirmedLocation.city || '' } : getDisplayLocation(weather)) : { title: '', subtitle: '' };

    // 只顯示未來 6 小時（後端一次回傳 8 筆 3 小時區間，前端只取前 6 筆）
    const displayedTrend = weather?.temperatureTrend6h?.slice(0, 6);

    // 未來六小時各時段的可跑度分數（AQI/PM2.5 沿用當前值估計，moenv 無逐時空品預報）
    const trendConditions =
        weather && displayedTrend
            ? displayedTrend.map((point) =>
                  getRunningCondition(
                      point.temperature,
                      weather.airQuality?.aqi,
                      weather.airQuality?.components.pm2_5,
                      point.humidity ?? weather.humidity,
                      point.windSpeed ?? weather.windSpeed,
                      runnerProfile.tolerance,
                  ),
              )
            : [];
    const bestTrendSlotIndex = pickBestSlotIndex(trendConditions.map((condition) => condition.score));

    // 訓練配速（Daniels VDOT）與日出日落（悶熱時建議改到日落後跑）
    // 台灣緯度不會出現極晝/極夜，但型別上 sunrise/sunset 仍可能為 null（suncalc 對高緯度的通用設計），故仍需防呆
    const trainingPaces = runnerProfile.targetPaceSecPerKm ? getTrainingPaces(runnerProfile.targetDistanceKm, runnerProfile.targetPaceSecPerKm) : null;
    const heatStress = weather && runningCondition ? getHeatStressLevel(weather.temperature, runningCondition.dewPoint) : 'none';
    const rawSunTimes = lastQueryCoords ? getSunTimes(lastQueryCoords.lat, lastQueryCoords.lon) : null;
    const sunTimes = rawSunTimes?.sunrise && rawSunTimes?.sunset ? { sunrise: rawSunTimes.sunrise, sunset: rawSunTimes.sunset } : null;
    const formatClockTime = (date: Date) => date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const suggestEveningRun = Boolean(heatStress !== 'none' && sunTimes && new Date() < sunTimes.sunset);

    const clothingAdvice = weather ? getClothingAdvice(weather.feelsLike) : null;
    const hydrationAdvice = weather && runningCondition ? getHydrationAdvice(weather.temperature, runningCondition.dewPoint, plannedDurationMinutes) : null;
    const windDirection = typeof weather?.windDeg === 'number' ? getCompassDirection(weather.windDeg) : null;

    const getFavoriteId = (district: string, city?: string) => {
        const normalizedDistrict = normalizeTaiwanText(district).trim();
        const normalizedCity = normalizeTaiwanText(city || '').trim();
        return `${normalizedCity}-${normalizedDistrict}`;
    };

    const currentFavoriteId = weather ? getFavoriteId(locationDisplay.title || weather.location, locationDisplay.subtitle || weather.city) : '';
    const isCurrentFavorite = currentFavoriteId ? favorites.some((item) => item.id === currentFavoriteId) : false;

    const toggleCurrentFavorite = () => {
        if (!weather) return;

        const district = locationDisplay.title || weather.location;
        const cityName = locationDisplay.subtitle || weather.city;
        const id = getFavoriteId(district, cityName);

        const exists = favorites.some((item) => item.id === id);
        if (exists) {
            setFavorites((prev) => prev.filter((item) => item.id !== id));
            showAlert(`已移除最愛：${district}`, 'info');
            return;
        }

        if (!lastQueryCoords) {
            showAlert('目前查詢沒有座標資訊，暫時無法收藏', 'warning');
            return;
        }

        if (favorites.length >= FAVORITES_LIMIT) {
            showAlert(`最多只能收藏 ${FAVORITES_LIMIT} 個地點，請先移除舊收藏`, 'warning');
            return;
        }

        const newFavorite: FavoriteLocation = {
            id,
            district,
            city: cityName,
            lat: lastQueryCoords.lat,
            lon: lastQueryCoords.lon,
            addedAt: Date.now(),
        };

        setFavorites((prev) => [newFavorite, ...prev]);
        showAlert(`已加入最愛：${district}`, 'success');
    };

    const removeFavorite = (favoriteId: string) => {
        setFavorites((prev) => prev.filter((item) => item.id !== favoriteId));
        showAlert('已移除最愛地點', 'info');
    };

    const handleFavoriteQuickSelect = async (favorite: FavoriteLocation) => {
        const selected: ConfirmedLocation = {
            district: favorite.district,
            city: favorite.city,
        };
        setCity(favorite.district);
        setConfirmedLocation(selected);
        await fetchWeather(`/api/weather/coordinates?lat=${favorite.lat}&lon=${favorite.lon}`, selected);
    };

    const applyTargetPace = () => {
        const minutes = parseFloat(targetPaceMinutesInput) || 0;
        const seconds = parseFloat(targetPaceSecondsInput) || 0;
        const totalSeconds = Math.round(minutes * 60 + seconds);
        setRunnerProfile((prev) => ({ ...prev, targetPaceSecPerKm: totalSeconds > 0 ? totalSeconds : null }));
        showAlert(totalSeconds > 0 ? '已儲存目標配速' : '已清除目標配速', 'success');
    };

    const clearTargetPace = () => {
        setTargetPaceMinutesInput('06');
        setTargetPaceSecondsInput('00');
        setRunnerProfile((prev) => ({ ...prev, targetPaceSecPerKm: null }));
    };

    const setTargetDistance = (value: string) => {
        setRunnerProfile((prev) => ({ ...prev, targetDistanceKm: Number(value) }));
    };

    const setTolerance = (tolerance: RunnerTolerance) => {
        setRunnerProfile((prev) => ({ ...prev, tolerance }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 flex flex-col h-full overflow-hidden">
            {/* 頂部跑者標題 */}
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-ink grid place-items-center shrink-0">
                    <Footprints size={22} aria-hidden />
                </div>
                <div className="min-w-0">
                    <h2 className="text-xl lg:text-2xl font-extrabold text-ink tracking-tight">跑者天氣站</h2>
                    <p className="text-xs lg:text-sm text-ink-muted">Runner&#8217;s Weather Hub</p>
                </div>
            </div>

            {/* 搜尋列 */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4 lg:mb-5 flex gap-2 z-dropdown max-w-3xl">
                <Button type="button" variant="primary" iconOnly onClick={handleGetCurrentLocation} title="定位" aria-label="定位">
                    <MapPin size={24} />
                </Button>
                <TextField
                    value={city}
                    onChange={handleInputChange}
                    placeholder="例如：西屯"
                    disabled={loading}
                    containerClassName="flex-1"
                    trailing={
                        <button
                            type="submit"
                            disabled={loading}
                            aria-label="搜尋"
                            className="grid place-items-center w-8 h-8 shrink-0 rounded-md text-ink-subtle cursor-pointer t-press hit-44 disabled:opacity-45 disabled:cursor-not-allowed [@media(hover:hover)]:hover:text-primary"
                        >
                            <Search size={20} />
                        </button>
                    }
                />
                <Button type="button" variant={showProfilePanel ? 'primary' : 'secondary'} iconOnly onClick={() => setShowProfilePanel((prev) => !prev)} title="跑者設定" aria-label="跑者設定">
                    <Settings size={20} />
                </Button>
            </form>

            {showProfilePanel && (
                <Modal onClose={() => setShowProfilePanel(false)} maxWidth="max-w-lg" label="跑者設定">
                    <h3 className="text-base font-black text-ink mb-3">跑者設定</h3>
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                        {/* 左塊：配速步進器 + 耐受選擇 */}
                        <div className="flex flex-wrap items-start gap-4">
                            <div>
                                <label className="block text-xs text-ink-muted mb-1.5">目標配速</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPaceModal(true)}
                                    className="flex items-baseline gap-1.5 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm hover:border-primary/50 active:scale-95 t-press"
                                >
                                    <span className="text-2xl font-black tabular-nums text-ink">{targetPaceMinutesInput}</span>
                                    <span className="text-xs font-semibold text-ink-muted">分</span>
                                    <span className="text-xl font-black text-ink-muted">:</span>
                                    <span className="text-2xl font-black tabular-nums text-ink">{targetPaceSecondsInput}</span>
                                    <span className="text-xs font-semibold text-ink-muted">秒 / km</span>
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs text-ink-muted mb-1">目標距離</label>
                                <Segmented aria-label="目標距離" value={String(runnerProfile.targetDistanceKm)} onChange={setTargetDistance} options={[...TARGET_DISTANCES]} />
                            </div>
                            <div>
                                <label className="block text-xs text-ink-muted mb-1">你比較怕熱還是怕冷？</label>
                                <Segmented
                                    aria-label="體感耐受"
                                    value={runnerProfile.tolerance}
                                    onChange={setTolerance}
                                    options={[
                                        { value: 'heat', label: '怕熱' },
                                        { value: 'normal', label: '普通' },
                                        { value: 'cold', label: '怕冷' },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* 右塊：套用 / 清除（ml-auto 確保同行靠右，換行後亦靠右下） */}
                        <div className="flex items-center gap-2 self-end ml-auto">
                            <Button type="button" variant="primary" size="sm" onClick={() => { applyTargetPace(); setShowProfilePanel(false); }}>
                                套用
                            </Button>
                            {runnerProfile.targetPaceSecPerKm && (
                                <Button type="button" variant="ghost" size="sm" onClick={clearTargetPace}>
                                    清除
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {favorites.length > 0 && (
                <div className="mb-4 max-w-4xl">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Heart size={14} className="text-danger fill-danger/25" />
                        <p className="text-xs font-semibold tracking-wide text-ink-muted">最愛地點</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {favorites.map((favorite) => (
                            <Chip
                                key={favorite.id}
                                label={favorite.city ? `${favorite.city}${favorite.district}` : favorite.district}
                                icon={MapPin}
                                title={`快速查詢 ${favorite.city ? `${favorite.city}${favorite.district}` : favorite.district}`}
                                onSelect={() => {
                                    void handleFavoriteQuickSelect(favorite);
                                }}
                                onRemove={() => removeFavorite(favorite.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 z-0">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {Array.from({ length: loadingSkeletonCount }).map((_, index) => (
                            <Card key={`weather-loading-skeleton-${index}`} className="flex flex-col gap-4 justify-center min-h-[150px]">
                                <Skeleton className="w-1/3" />
                                <Skeleton className="w-4/5 h-9" />
                                <Skeleton className="w-2/3" />
                                <Skeleton className="w-1/2" />
                            </Card>
                        ))}
                    </div>
                ) : weather ? (
                    <div className="h-full overflow-y-auto pb-6 scrollbar-hide">
                        {/* 三欄排版：跑步狀態與評分佔兩欄；其餘資訊依重要度由左至右、由上至下分配 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                            {/* Q1: 現在適合跑嗎（佔兩欄） */}
                            {runningCondition && (
                                /* Readout family · Stat-Led: the score is the page's
                                   one giant number, on a solid bleed-colour band.
                                   Gone from the previous build: two blurred floating
                                   orbs, three glass panels, and eight text-shadows
                                   propping up white text on a surface too light to
                                   carry it. The band token is dark enough unaided. */
                                <section aria-label="跑步狀態與評分" className={`md:col-span-2 min-w-0 ${runningCondition.color} text-score-ink rounded-3xl p-5 lg:p-6`}>
                                    <div className="flex justify-between items-start gap-3 flex-wrap">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={18} aria-hidden className="shrink-0" />
                                                <h2 className="text-xl lg:text-2xl font-extrabold leading-tight tracking-tight">{locationDisplay.title || weather.location}</h2>
                                                <button
                                                    type="button"
                                                    onClick={toggleCurrentFavorite}
                                                    className="ml-1 grid place-items-center w-9 h-9 shrink-0 rounded-pill bg-score-ink/15 cursor-pointer t-press [@media(hover:hover)]:hover:bg-score-ink/25 [@media(hover:hover)]:active:translate-y-px"
                                                    title={isCurrentFavorite ? '從最愛移除' : '加入最愛'}
                                                    aria-label={isCurrentFavorite ? '從最愛移除' : '加入最愛'}
                                                    aria-pressed={isCurrentFavorite}
                                                >
                                                    <Heart size={16} className={isCurrentFavorite ? 'fill-current' : ''} />
                                                </button>
                                            </div>
                                            {locationDisplay.subtitle && <p className="text-xs font-medium opacity-90 ml-6 mt-0.5">{locationDisplay.subtitle}</p>}
                                        </div>
                                        <p className="inline-flex items-center gap-1.5 text-xs font-bold rounded-lg bg-score-ink/15 px-2.5 py-1.5">
                                            <Clock size={13} aria-hidden />
                                            {formatTime(weather.timestamp)}
                                        </p>
                                    </div>

                                    {/* The one --text-readout numeral this family allows.
                                        items-baseline, not items-end: the two are different
                                        sizes, so aligning boxes leaves the digits floating —
                                        only a shared baseline reads as bottom-aligned.
                                        leading stays >= 1: CJK glyphs fill the full em box and
                                        anything tighter bleeds up into the location title. */}
                                    <div className="mt-8 mb-7 lg:mt-9 lg:mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                                        <p className="font-display text-readout font-black leading-[1.02] tracking-tight">{runningCondition.text}</p>
                                        <p className="flex items-baseline gap-1">
                                            {/* One step below the readout at every width, so the
                                                hierarchy survives the clamp floor on mobile. */}
                                            <span className="font-display text-4xl sm:text-5xl font-black leading-none tabular-nums">{runningCondition.score}</span>
                                            <span className="text-sm font-bold opacity-80">/100</span>
                                        </p>
                                    </div>

                                    {/* Within-band gradation — the signal the brightness
                                        filter used to carry, moved off the text surface. */}
                                    <div
                                        className="mt-3 h-1.5 rounded-pill bg-score-ink/20 overflow-hidden"
                                        role="img"
                                        aria-label={`綜合分數 ${runningCondition.score} 分，滿分 100 分`}
                                    >
                                        <div className="h-full rounded-pill bg-score-ink/85" style={{ width: `${runningCondition.score}%` }} />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                                        {[
                                            { label: '溫度佳', penalty: runningCondition.penalties.temperature },
                                            { label: 'PM2.5 佳', penalty: runningCondition.penalties.airQuality },
                                            { label: '濕度佳', penalty: runningCondition.penalties.humidity },
                                            { label: '露點佳', penalty: runningCondition.penalties.dewPoint },
                                            { label: '風速佳', penalty: runningCondition.penalties.wind },
                                        ]
                                            .filter((item) => item.penalty === 0)
                                            .map((item) => (
                                                <span key={item.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-score-ink/15">
                                                    <Check size={12} aria-hidden />
                                                    {item.label}
                                                </span>
                                            ))}
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="rounded-xl bg-score-ink/12 px-3 py-2.5">
                                            <p className="text-xs font-semibold opacity-85">當前氣溫</p>
                                            <p className="font-display text-3xl font-black leading-none tabular-nums mt-1">{weather.temperature}°C</p>
                                            <p className="text-xs opacity-80 mt-1">
                                                體感 {weather.feelsLike}°C・露點 {runningCondition.dewPoint}°C
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-score-ink/12 px-3 py-2.5 sm:col-span-2">
                                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-85">
                                                <Footprints size={13} aria-hidden />
                                                配速建議
                                            </p>
                                            {trainingPaces ? (
                                                <>
                                                    <p className="text-xs opacity-75 mt-1 tabular-nums">
                                                        目標 {TARGET_DISTANCES.find((d) => Number(d.value) === runnerProfile.targetDistanceKm)?.label} @ {formatPace(runnerProfile.targetPaceSecPerKm!)}/km・VDOT {trainingPaces.vdot}
                                                    </p>
                                                    <dl className="grid grid-cols-3 gap-2 mt-1.5 tabular-nums">
                                                        {(
                                                            [
                                                                ['輕鬆跑', trainingPaces.easy],
                                                                ['節奏跑', trainingPaces.tempo],
                                                                ['間歇', trainingPaces.interval],
                                                            ] as const
                                                        ).map(([label, range]) => (
                                                            <div key={label}>
                                                                <dt className="text-2xs font-semibold opacity-75">{label}</dt>
                                                                <dd className="text-sm font-black leading-tight">
                                                                    {formatPace(range.minSecPerKm)}~{formatPace(range.maxSecPerKm)}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                </>
                                            ) : (
                                                <p className="text-xs opacity-80 mt-1">於設定區輸入目標配速與距離，即可取得輕鬆跑／節奏跑／間歇配速</p>
                                            )}
                                        </div>
                                    </div>
                                    {weather.source && <p className="text-xs opacity-70 text-right mt-3 font-medium">資料來源：{weather.source}</p>}
                                </section>
                            )}

                            {/* 第三欄第一格：即時數據磚（與評分卡同排，優先度僅次於它） */}
                            <div className="grid grid-cols-2 gap-3 content-start min-w-0">
                                <Tile icon={Droplets} label="濕度" value={weather.humidity} unit="%" hint={weather.humidity > 70 ? '▲ 影響散熱' : '✓ 舒適'} accent="info" />
                                <Tile icon={Wind} label="風速" value={weather.windSpeed} unit="km/h" hint={weather.windSpeed > 20 ? '▲ 強風' : '✓ 微風'} accent="success" />
                                <Tile
                                    icon={Activity}
                                    label="PM2.5"
                                    value={weather.airQuality?.components.pm2_5.toFixed(1)}
                                    hint={(weather.airQuality?.components.pm2_5 || 0) > PM25_BREAKPOINTS.sensitiveUnhealthy ? '▲ 不佳' : '✓ 良好'}
                                    accent="accent"
                                />
                                <Tile
                                    icon={CloudRain}
                                    label="降雨機率"
                                    value={typeof weather.precipitationProbability === 'number' ? weather.precipitationProbability : '--'}
                                    unit="%"
                                    hint={
                                        typeof weather.precipitationProbability !== 'number'
                                            ? '資料更新中'
                                            : weather.precipitationProbability >= 60
                                              ? '▲ 建議備雨具'
                                              : weather.precipitationProbability >= 30
                                                ? '☁️ 可能有雨'
                                                : '✓ 降雨機率低'
                                    }
                                    accent="warn"
                                />
                                {typeof weather.uvIndex === 'number' && (
                                    <Tile icon={Sun} label="紫外線" value={weather.uvIndex} hint={weather.uvIndex >= 8 ? `▲ ${weather.uvLevel}` : `✓ ${weather.uvLevel}`} accent="danger" />
                                )}
                                {clothingAdvice && <Tile icon={ThermometerSun} label="穿著建議" value={<span className="text-xl whitespace-nowrap">{clothingAdvice.title}</span>} hint={clothingAdvice.description} accent="warn" />}
                            </div>

                            {/* 第一欄：空氣品質建議 → 補水建議 → 風速與風向 */}
                            <div className="flex flex-col gap-4 min-w-0">
                                {sunTimes && (
                                    <GuideCard
                                        icon={Sunrise}
                                        title="日出日落"
                                        desc={`日出 ${formatClockTime(sunTimes.sunrise)}・日落 ${formatClockTime(sunTimes.sunset)}${suggestEveningRun ? '。目前偏悶熱，建議日落後再跑，體感較涼爽。' : ''}`}
                                        accent="warn"
                                    />
                                )}
                                <GuideCard
                                    icon={Activity}
                                    title="空氣品質建議"
                                    desc="AQI 等級 1-2（良好/普通）最適合跑步，等級 3（敏感族群不健康）可正常訓練但敏感族群留意，等級 4-5（不健康以上）建議減少戶外高強度運動，改室內訓練。"
                                    accent="accent"
                                />

                                {hydrationAdvice && (
                                    <GuideCard
                                        icon={Droplets}
                                        title="補水建議"
                                        desc={hydrationAdvice.message}
                                        accent="info"
                                        action={
                                            <div className="flex gap-1">
                                                {[30, 60, 90].map((minutes) => (
                                                    <button
                                                        key={minutes}
                                                        type="button"
                                                        onClick={() => setPlannedDurationMinutes(minutes)}
                                                        className={`px-2 py-1 rounded-md text-2xs font-semibold cursor-pointer t-press hit-44 ${
                                                            plannedDurationMinutes === minutes ? 'bg-primary text-primary-ink' : 'bg-surface-3 text-ink-muted'
                                                        }`}
                                                    >
                                                        {minutes}分
                                                    </button>
                                                ))}
                                            </div>
                                        }
                                    />
                                )}
                                <GuideCard
                                    icon={Wind}
                                    title="風速與風向"
                                    desc={
                                        windDirection
                                            ? `目前為${windDirection}風。風速 > 20 km/h 時逆風阻力顯著增加，配速可能受影響；建議去程頂風、回程順風，較省力。`
                                            : '風速 > 20 km/h 逆風時阻力顯著增加，配速可能受影響。順風時注意不要跑太快。'
                                    }
                                />
                            </div>

                            {/* 第二欄：空氣品質明細 */}
                            <div className="flex flex-col gap-4 min-w-0">
                                {weather.airQuality && (
                                    <Card className="p-5!">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="text-accent" size={20} />
                                                <h3 className="text-sm font-black text-ink uppercase tracking-wider">空氣品質</h3>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${getAqiColor(weather.airQuality.aqi)}`}>
                                                <span>AQI {weather.airQuality.aqi}</span>
                                                <span className="border-l border-white/30 pl-2">{weather.airQuality.description}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-border pt-4">
                                            <div className="text-center bg-surface-3 p-2 rounded-lg border border-border">
                                                <div className="text-2xs text-ink-muted mb-1 font-semibold">PM2.5</div>
                                                <div className="font-black text-base text-ink">{weather.airQuality.components.pm2_5.toFixed(1)}</div>
                                            </div>
                                            <div className="text-center bg-surface-3 p-2 rounded-lg border border-border">
                                                <div className="text-2xs text-ink-muted mb-1 font-semibold">PM10</div>
                                                <div className="font-black text-base text-ink">{weather.airQuality.components.pm10.toFixed(1)}</div>
                                            </div>
                                            <div className="text-center bg-surface-3 p-2 rounded-lg border border-border">
                                                <div className="text-2xs text-ink-muted mb-1 font-semibold">NO2</div>
                                                <div className="font-black text-base text-ink">{weather.airQuality.components.no2.toFixed(1)}</div>
                                            </div>
                                            <div className="text-center bg-surface-3 p-2 rounded-lg border border-border">
                                                <div className="text-2xs text-ink-muted mb-1 font-semibold">O3</div>
                                                <div className="font-black text-base text-ink">{weather.airQuality.components.o3.toFixed(1)}</div>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* 第三欄（接續數據磚）：未來 6 小時路跑合適分數 */}
                            <div className="flex flex-col gap-4 min-w-0">
                                {displayedTrend && displayedTrend.length > 0 && (
                                    <Card>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-black text-ink tracking-wide">未來 6 小時路跑合適分數</h3>
                                            <span className="text-2xs text-ink-muted">每 3 小時更新</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {displayedTrend.map((point, index) => {
                                                const condition = trendConditions[index];
                                                const isBest = index === bestTrendSlotIndex;
                                                return (
                                                    <div
                                                        key={`${point.time}-${index}`}
                                                        className={`relative rounded-xl bg-surface-2 px-3 py-2 border ${
                                                            isBest ? 'border-success ring-2 ring-success/35' : 'border-border'
                                                        }`}
                                                    >
                                                        {isBest && (
                                                            <span className="absolute -top-2 -right-1.5 grid place-items-center w-5 h-5 rounded-pill bg-success text-success-ink" title="建議時段">
                                                                <Star size={11} aria-hidden className="fill-current" />
                                                            </span>
                                                        )}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs text-ink-muted font-medium shrink-0">{formatHourMinute(point.time)}</p>
                                                            <img src={getWeatherIconUrl(getTrendIconCode(point.icon, point.time))} alt={point.description} className="w-9 h-9 shrink-0" />
                                                            <p className="text-xl font-black text-ink leading-tight shrink-0">{point.temperature}°C</p>
                                                        </div>
                                                        {condition && (
                                                            <div className="mt-2">
                                                                <div className={`h-1.5 rounded-full bg-gradient-to-r ${condition.color}`} />
                                                                <p className="text-2xs text-ink-muted mt-1 font-semibold">
                                                                    {condition.text} {condition.score}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {typeof point.precipitationProbability === 'number' && point.precipitationProbability >= 60 && (
                                                            <p className="text-2xs text-info dark:text-info mt-0.5">☔ 降雨 {point.precipitationProbability}%</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center pb-20">
                        <EmptyState icon={Cloud} message="請搜尋城市或使用定位" className="border-none" />
                    </div>
                )}
            </div>

            {showPaceModal && (
                <Modal onClose={() => setShowPaceModal(false)}>
                    <h3 className="text-base font-black text-ink mb-0.5">設定目標配速</h3>

                    {/* ── 手機：水平滾輪（觸控） ── */}
                    <p className="text-xs text-ink-muted mb-5 sm:hidden">上下滑動選擇每公里配速</p>
                    <div className="flex sm:hidden items-center justify-center gap-3">
                        <ScrollPicker value={targetPaceMinutesInput} onChange={setTargetPaceMinutesInput} items={minuteItems} label="分" />
                        <span className="text-2xl font-black text-ink-muted mt-6">:</span>
                        <ScrollPicker value={targetPaceSecondsInput} onChange={setTargetPaceSecondsInput} items={secondItems} label="秒" />
                    </div>

                    {/* ── 電腦：垂直 減少 / 輸入 / 增加 ── */}
                    <p className="hidden sm:block text-xs text-ink-muted mb-4">每公里配速</p>
                    <div className="hidden sm:flex flex-col gap-4 items-center">
                        {[
                            {
                                label: '分',
                                value: targetPaceMinutesInput,
                                set: setTargetPaceMinutesInput,
                                min: 1,
                                max: 20,
                                dec: (p: string) => String(Math.max(1, (parseInt(p) || 6) - 1)).padStart(2, '0'),
                                inc: (p: string) => String(Math.min(20, (parseInt(p) || 6) + 1)).padStart(2, '0'),
                            },
                            {
                                label: '秒',
                                value: targetPaceSecondsInput,
                                set: setTargetPaceSecondsInput,
                                min: 0,
                                max: 59,
                                dec: (p: string) => String(Math.max(0, (parseInt(p) || 0) - 1)).padStart(2, '0'),
                                inc: (p: string) => String(Math.min(59, (parseInt(p) || 0) + 1)).padStart(2, '0'),
                            },
                        ].map(({ label, value, set, min, max, dec, inc }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-ink-muted w-5">{label}</span>
                                <Button type="button" variant="ghost" size="sm" iconOnly onClick={() => set(dec(value))}>
                                    <span className="text-base leading-none select-none">−</span>
                                </Button>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => set(e.target.value)}
                                    min={min}
                                    max={max}
                                    className="w-20 text-center text-2xl font-black text-ink tabular-nums py-2 bg-surface border border-border rounded-xl shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <Button type="button" variant="ghost" size="sm" iconOnly onClick={() => set(inc(value))}>
                                    <span className="text-base leading-none select-none">+</span>
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-5 gap-2">
                        <Button variant="ghost" onClick={() => setShowPaceModal(false)}>
                            取消
                        </Button>
                        <Button variant="primary" onClick={() => setShowPaceModal(false)}>
                            確認
                        </Button>
                    </div>
                </Modal>
            )}

            {showLocationModal && locationOptions.length > 1 && (
                <Modal onClose={() => setShowLocationModal(false)}>
                    <h3 className="text-lg font-bold text-ink mb-2">請選擇地點</h3>
                    <p className="text-sm text-ink-muted mb-3">找到多個符合結果，請選擇要查詢的鄉鎮市區。</p>

                    <div className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
                        <div className="relative w-7 h-7 shrink-0">
                            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeDasharray="62.83"
                                    strokeDashoffset={62.83 * (1 - autoSelectRemaining / AUTO_SELECT_SECONDS)}
                                    className="text-primary t-surface"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-2xs font-bold text-ink">{autoSelectRemaining}</span>
                        </div>
                        <span>{autoSelectRemaining} 秒內未選擇，將自動套用第一個地點</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                        {locationOptions.map((item, index) => (
                            <button
                                key={`${item.lat}-${item.lon}-${index}`}
                                type="button"
                                onClick={() => handleLocationSelect(item)}
                                className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                            >
                                <div className="font-semibold text-ink">{item.name}</div>
                                <div className="text-xs text-ink-muted mt-0.5">{item.state || '台灣'}</div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button variant="ghost" onClick={() => setShowLocationModal(false)}>
                            取消
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default WeatherChecker;
