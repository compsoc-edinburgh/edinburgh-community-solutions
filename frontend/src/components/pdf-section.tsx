import * as React from "react";
import { PdfSection } from "../interfaces";
import { SectionRenderer, Dimensions } from "../split-render";
import { fetchpost } from '../fetchutils'
import { css } from "glamor";

interface Props {
  section: PdfSection;
  renderer: SectionRenderer;
  width: number;
  dpr: number; // Device Pixel Ratio
  isAdmin: boolean;
  filename: string;
  onSectionChange: () => void;
}

const styles = {
  canvas: css({
    display: "block",
  }),
};

const contentRelevantProps: Array<keyof Props> = [
  "section",
  "renderer",
  "width",
  "dpr",
];

export default class PdfSectionComp extends React.Component<Props> {
  private ctx?: CanvasRenderingContext2D;
  private lastCtx?: CanvasRenderingContext2D;
  private propsChanged = true;

  componentWillReceiveProps(nextProps: Props) {
    if (contentRelevantProps.some(k => this.props[k] !== nextProps[k])) {
      this.propsChanged = true;
    }
  }

  componentDidMount() {
    this.renderCanvas();
  }

  componentDidUpdate() {
    this.renderCanvas();
  }

  addSection = async (ev: React.MouseEvent<HTMLElement>) => {
    const boundingRect = ev.currentTarget.getBoundingClientRect()
    const yoff = ev.clientY - boundingRect.top;
    const relative = yoff / boundingRect.height;
    const start = this.props.section.start.position;
    const end = this.props.section.end.position;
    const relHeight = start + relative * (end - start);

    await fetchpost(`/api/exam/${this.props.filename}/newanswersection`, {
      pageNum: this.props.section.start.page,
      relHeight: relHeight
    });
    this.props.onSectionChange();
  };

  render() {
    const { dpr } = this.props;
    const rawDim = this.sectionDimensions();
    return (
      <canvas
        ref={this.saveCanvasRef}
        width={Math.ceil(rawDim.width * dpr)}
        height={Math.ceil(rawDim.height * dpr)}
        onClick={this.props.isAdmin ? this.addSection : undefined}
        style={{
          width: Math.ceil(rawDim.width),
          height: Math.ceil(rawDim.height),
        }}
        {...styles.canvas}
      />
    );
  }

  renderCanvas() {
    if (!this.ctx || (!this.propsChanged && this.ctx === this.lastCtx)) {
      return;
    }
    this.lastCtx = this.ctx;
    this.propsChanged = false;

    const { section, renderer, dpr } = this.props;
    const dim = this.sectionDimensions();
    renderer.render(
      { context: this.ctx, width: dim.width * dpr, height: dim.height * dpr },
      section.start,
      section.end,
    );
  }

  sectionDimensions(): Dimensions {
    const { section, renderer, width } = this.props;
    return renderer.sectionDimensions(section.start, section.end, width);
  }

  saveCanvasRef = (c: HTMLCanvasElement) => {
    if (!c) {
      return;
    }
    const ctx = c.getContext("2d");
    if (!ctx) {
      // tslint:disable-next-line:no-console
      console.error("couldn't create canvas context");
      return;
    }
    this.ctx = ctx;
  };
}
