import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-error" role="alert">
        <section>
          <p>Tablo Generator</p>
          <h1>Aplikacija se nije ucitala kako treba.</h1>
          <button type="button" onClick={() => window.location.reload()}>
            Osvezi stranicu
          </button>
        </section>
      </main>
    );
  }
}
