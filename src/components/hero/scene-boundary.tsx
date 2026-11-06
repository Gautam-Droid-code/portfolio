"use client";

import { Component, type ReactNode } from "react";

type SceneBoundaryProps = {
  children: ReactNode;
  onError?: () => void;
};

type SceneBoundaryState = {
  failed: boolean;
};

/**
 * react-spline v4 re-throws scene load failures during render and exposes no
 * onError prop. This boundary keeps a failed scene from taking down the hero.
 */
export class SceneBoundary extends Component<
  SceneBoundaryProps,
  SceneBoundaryState
> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
