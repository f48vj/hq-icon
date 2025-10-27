import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import drawOutline from './drawOutline';
import './Result.css';

function Result({ data, resolution }) {
    const [base64, setBase64] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        drawOutline(data, resolution)
            .then((outline) => {
                if (isMounted) {
                    setBase64(outline);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setBase64('');
                    setIsLoading(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [data, resolution]);

    const platform = useMemo(() => {
        const kind = (data.kind || '').toLowerCase();
        if (kind.includes('vision')) {
            return 'visionOS';
        }
        if (kind.includes('watch')) {
            return 'watchOS';
        }
        if (kind.includes('mac')) {
            return 'macOS';
        }
        return 'iOS';
    }, [data.kind]);

    const fileName = `${data.trackName}-${platform}-${resolution}x${resolution}.png`;

    return (
        <article className="result-card">
            <div className="icon-wrapper">
                {isLoading ? (
                    <div className="icon-skeleton" />
                ) : base64 ? (
                    <a href={base64} download={fileName}>
                        <img src={base64} alt={data.trackName} className="icon" />
                    </a>
                ) : (
                    <div className="icon-placeholder">Icon unavailable</div>
                )}
            </div>
            <div className="meta">
                <div className="meta-top">
                    <span className={`platform-badge platform-${platform.toLowerCase()}`}>
                        {platform}
                    </span>
                    {data.formattedPrice && (
                        <span className="price">{data.formattedPrice}</span>
                    )}
                </div>
                <h3 title={data.trackName}>{data.trackName}</h3>
                <p className="seller" title={data.sellerName}>
                    {data.sellerName}
                </p>
                <div className="meta-bottom">
                    {data.version && <span className="detail">v{data.version}</span>}
                    {data.primaryGenreName && (
                        <span className="detail">{data.primaryGenreName}</span>
                    )}
                    <a
                        href={data.trackViewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="detail link"
                    >
                        View in App Store
                    </a>
                </div>
            </div>
        </article>
    );
}

Result.propTypes = {
    data: PropTypes.object.isRequired,
    resolution: PropTypes.number.isRequired,
};

export default Result;
