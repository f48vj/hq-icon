import React, { Component } from 'react';
import Result from './Result';
import {
    expandShortLink,
    searchAppById,
    searchIosApp,
    searchMacApp,
} from './iTunes';
import search from './search.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            results: [],
            country: 'US',
            resolution: 512,
        };
        this.search = this.search.bind(this);
    }

    async search() {
        let { input, country } = this.state;
        input = input.trim();
        let url = input;
        const itunesReg = /^(http|https):\/\/itunes/;
        const idReg = /\/id(\d+)/i;
        const shortReg = /^(http|https):\/\/appsto/;

        try {
            if (shortReg.test(input)) {
                url = await expandShortLink(input);
            }
            if (itunesReg.test(url) && idReg.test(url)) {
                const id = idReg.exec(url)[1];
                const data = await searchAppById(id, country);
                this.setState({ results: data.results });
            } else {
                const data = await Promise.all([
                    searchIosApp(input, country),
                    searchMacApp(input, country),
                ]);
                this.setState({
                    results: data[0].results.concat(data[1].results),
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        const { input, results, country, resolution } = this.state;
        return (
            <div className="app">
                <header>
                    <div className="center">
                        <div className="logo">HQ ICON</div>
                        <div className="description">
                            Get high quality icons from App Store
                        </div>
                        <div className="options">
                            Country:
                            <lable
                                onClick={() => this.setState({ country: 'US' })}
                            >
                                <input
                                    name="store"
                                    type="radio"
                                    checked={country === 'US'}
                                />US 🇺🇸
                            </lable>
                            <lable
                                onClick={() => this.setState({ country: 'CN' })}
                            >
                                <input
                                    name="store"
                                    type="radio"
                                    checked={country === 'CN'}
                                />CN 🇨🇳
                            </lable>
                            <lable
                                onClick={() => this.setState({ country: 'JP' })}
                            >
                                <input
                                    name="store"
                                    type="radio"
                                    checked={country === 'JP'}
                                />JP 🇯🇵
                            </lable>
                        </div>
                        <div className="options">
                            Image Resolution:
                            <lable
                                onClick={() =>
                                    this.setState({ resolution: 512 })
                                }
                            >
                                <input
                                    name="resolution"
                                    type="radio"
                                    checked={resolution === 512}
                                />
                                512x512
                            </lable>
                            <lable
                                onClick={() =>
                                    this.setState({ resolution: 1024 })
                                }
                            >
                                <input
                                    name="resolution"
                                    type="radio"
                                    checked={resolution === 1024}
                                />
                                1024x1024
                            </lable>
                        </div>
                        <div className="search">
                            <input
                                className="search-input"
                                placeholder="iTunes url or App name"
                                value={input}
                                onChange={(e) =>
                                    this.setState({ input: e.target.value })
                                }
                                onKeyDown={(e) =>
                                    e.keyCode === 13 ? this.search() : ''
                                }
                            />
                            <div
                                className="search-button"
                                onClick={this.search}
                            >
                                <img
                                    src={search}
                                    className="search-icon"
                                    alt="search"
                                />
                            </div>
                        </div>
                        <a
                            className="github-button"
                            href="https://github.com/zhangweijie-cn/hq-icon"
                            data-style="mega"
                            aria-label="Star zhangweijie-cn/hq-icon on GitHub"
                        >
                            Star
                        </a>
                    </div>
                </header>
                <main className="results">
                    {results.map((result) => (
                        <Result
                            key={result.trackId}
                            data={result}
                            resolution={resolution}
                        />
                    ))}
                </main>
                <footer className="footer">
                    Created by @<a href="https://github.com/zhangweijie-cn">
                        zhangweijie-cn
                    </a>
                </footer>
            </div>
        );
    }
}

export default App;
