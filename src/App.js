import React, { useCallback, useMemo, useState } from 'react';
import Result from './Result';
import {
    expandShortLink,
    searchAppById,
    searchIosApp,
    searchMacApp,
    searchVisionApp,
    searchWatchApp,
} from './iTunes';
import searchIcon from './search.svg';
import './App.css';

const COUNTRY_OPTIONS = [
    { code: 'US', label: 'United States', flag: '🇺🇸' },
    { code: 'CN', label: 'China', flag: '🇨🇳' },
    { code: 'JP', label: 'Japan', flag: '🇯🇵' },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', label: 'Germany', flag: '🇩🇪' },
    { code: 'FR', label: 'France', flag: '🇫🇷' },
    { code: 'CA', label: 'Canada', flag: '🇨🇦' },
    { code: 'AU', label: 'Australia', flag: '🇦🇺' },
    { code: 'KR', label: 'South Korea', flag: '🇰🇷' },
    { code: 'IN', label: 'India', flag: '🇮🇳' },
];

const PLATFORM_OPTIONS = [
    { key: 'ios', label: 'iOS & iPadOS', badge: 'iOS', search: searchIosApp },
    { key: 'mac', label: 'macOS', badge: 'macOS', search: searchMacApp },
    { key: 'vision', label: 'visionOS', badge: 'visionOS', search: searchVisionApp },
    { key: 'watch', label: 'watchOS', badge: 'watchOS', search: searchWatchApp },
];

const RESOLUTION_OPTIONS = [
    { value: 512, label: '512 × 512' },
    { value: 1024, label: '1024 × 1024' },
];

const itunesReg = /^(http|https):\/\/itunes/;
const idReg = /\/id(\d+)/i;
const shortReg = /^(http|https):\/\/appsto/;

function App() {
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState('US');
    const [resolution, setResolution] = useState(1024);
    const [selectedPlatforms, setSelectedPlatforms] = useState(
        PLATFORM_OPTIONS.map((platform) => platform.key)
    );
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const platformMap = useMemo(() => {
        return PLATFORM_OPTIONS.reduce((acc, platform) => {
            acc[platform.key] = platform;
            return acc;
        }, {});
    }, []);

    const togglePlatform = (platformKey) => {
        setSelectedPlatforms((prev) => {
            if (prev.includes(platformKey)) {
                return prev.filter((key) => key !== platformKey);
            }
            return [...prev, platformKey];
        });
    };

    const dedupeResults = useCallback((apps) => {
        const seen = new Map();
        apps.forEach((app) => {
            if (!seen.has(app.trackId)) {
                seen.set(app.trackId, app);
            }
        });
        return Array.from(seen.values());
    }, []);

    const performSearch = useCallback(async () => {
        let input = query.trim();
        if (!input) {
            setError('Enter an app name or App Store URL to start searching.');
            setResults([]);
            return;
        }
        setLoading(true);
        setError('');
        let url = input;

        try {
            if (shortReg.test(input)) {
                url = await expandShortLink(input);
            }

            if (itunesReg.test(url) && idReg.test(url)) {
                const id = idReg.exec(url)[1];
                const data = await searchAppById(id, country);
                setResults(data.results || []);
                if (!data.results || !data.results.length) {
                    setError('No results found for that App Store link.');
                }
                return;
            }

            const activePlatforms = selectedPlatforms.length
                ? selectedPlatforms
                : PLATFORM_OPTIONS.map((platform) => platform.key);

            const platformPromises = activePlatforms.map((key) =>
                platformMap[key]
                    .search(input, country)
                    .then((data) => data.results || [])
                    .catch(() => [])
            );

            const responses = await Promise.all(platformPromises);
            const apps = dedupeResults(responses.flat());
            setResults(apps);

            if (!apps.length) {
                setError('No matching apps were found. Try a different query.');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong while contacting the App Store.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [
        country,
        dedupeResults,
        platformMap,
        query,
        selectedPlatforms,
    ]);

    const handleSubmit = (event) => {
        event.preventDefault();
        performSearch();
    };

    return (
        <div className="app-shell">
            <div className="gradient" />
            <div className="app">
                <header className="header">
                    <div className="brand">
                        <span className="brand-badge">HQ</span>
                        <div>
                            <h1>App Icon Studio</h1>
                            <p>Download crisp icons for iOS, macOS, watchOS, and visionOS apps.</p>
                        </div>
                    </div>
                    <form className="search-panel" onSubmit={handleSubmit}>
                        <div className="field-group">
                            <label htmlFor="query">Search the App Store</label>
                            <div className="search-bar">
                                <input
                                    id="query"
                                    type="text"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Paste an App Store link or type an app name"
                                />
                                <button
                                    type="submit"
                                    className="icon-button"
                                    disabled={loading}
                                >
                                    <img src={searchIcon} alt="Search" />
                                </button>
                            </div>
                        </div>
                        <div className="field-grid">
                            <div className="field-group">
                                <label>Country</label>
                                <div className="segmented">
                                    {COUNTRY_OPTIONS.map((option) => (
                                        <button
                                            key={option.code}
                                            type="button"
                                            className={`segmented-item ${
                                                country === option.code ? 'active' : ''
                                            }`}
                                            onClick={() => setCountry(option.code)}
                                        >
                                            <span role="img" aria-hidden="true">
                                                {option.flag}
                                            </span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Platforms</label>
                                <div className="chip-row">
                                    {PLATFORM_OPTIONS.map((platform) => {
                                        const isActive = selectedPlatforms.includes(platform.key);
                                        return (
                                            <button
                                                key={platform.key}
                                                type="button"
                                                className={`chip ${isActive ? 'chip-active' : ''}`}
                                                onClick={() => togglePlatform(platform.key)}
                                            >
                                                {platform.badge}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Icon resolution</label>
                                <div className="segmented">
                                    {RESOLUTION_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`segmented-item ${
                                                resolution === option.value ? 'active' : ''
                                            }`}
                                            onClick={() => setResolution(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </header>
                <main className="results">
                    {loading && <div className="status">Searching the App Store…</div>}
                    {!loading && error && <div className="status error">{error}</div>}
                    {!loading && !error && results.length === 0 && (
                        <div className="status">Start with a search to see app icons.</div>
                    )}
                    <div className="result-grid">
                        {results.map((result) => (
                            <Result
                                key={result.trackId}
                                data={result}
                                resolution={resolution}
                            />
                        ))}
                    </div>
                </main>
                <footer className="footer">
                    Built with ❤️ for app designers. View on{' '}
                    <a
                        href="https://github.com/zhangweijie-cn/hq-icon"
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                    </a>
                    .
                </footer>
            </div>
        </div>
    );
}

export default App;
