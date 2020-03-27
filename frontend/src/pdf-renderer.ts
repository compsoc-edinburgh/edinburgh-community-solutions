import pdfjs, {
  PDFPageProxy,
  PDFDocumentProxy,
  PDFPromise,
  TextContent,
} from "./pdfjs";
export interface CanvasObject {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}
class CanvasFactory {
  private canvasArray: Array<CanvasObject> = [];
  private objectIndexMap: Map<CanvasObject, number> = new Map();
  private free: Set<number> = new Set();
  getFreeIndex(): number | undefined {
    for (const index of this.free) return index;
    return undefined;
  }
  create(width: number | undefined, height: number | undefined) {
    const index = this.getFreeIndex();
    if (index !== undefined) {
      const obj = this.canvasArray[index];
      this.free.delete(index);
      if (
        (width === undefined || width === obj.canvas.width) &&
        (height === undefined || height === obj.canvas.height)
      ) {
        const context = obj.context;
        context.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
      }
      if (width) obj.canvas.width = width;
      if (height) obj.canvas.height = height;
      return obj;
    } else {
      const canvas = document.createElement("canvas");
      if (width) canvas.width = width;
      if (height) canvas.height = height;
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Could not create canvas context.");
      const obj = { canvas, context };
      this.canvasArray.push(obj);
      this.objectIndexMap.set(obj, this.canvasArray.length - 1);
      return obj;
    }
  }
  reset(obj: CanvasObject, width: number, height: number) {
    if (!obj.canvas) {
      throw new Error("Canvas is not specified");
    }
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    obj.canvas.width = width;
    obj.canvas.height = height;
  }
  destroy(obj: CanvasObject) {
    if (!obj.canvas) {
      throw new Error("Canvas is not specified");
    }
    const index = this.objectIndexMap.get(obj);
    if (index === undefined) return;
    this.free.add(index);
  }
}
const globalFactory = new CanvasFactory();
export class PdfCanvasReference {
  active: boolean;
  manager: PdfCanvasReferenceManager;
  private listeners: Array<() => void> = [];
  constructor(manager: PdfCanvasReferenceManager) {
    this.active = true;
    this.manager = manager;
  }
  addListener(fn: () => void) {
    this.listeners.push(fn);
  }
  release() {
    if (!this.active) return;
    this.manager.dec();
    for (const listener of this.listeners) listener();
    this.active = false;
  }
}
export class PdfCanvasReferenceManager {
  private refCount: number;
  private listeners: Array<(cnt: number) => void> = [];
  constructor(initialRefCount: number) {
    this.refCount = initialRefCount;
  }
  createRetainedRef(): PdfCanvasReference {
    this.inc();
    const ref = new PdfCanvasReference(this);
    return ref;
  }
  addListener(fn: (cnt: number) => void) {
    this.listeners.push(fn);
  }
  inc() {
    this.refCount++;
    for (const listener of this.listeners) {
      listener(this.refCount);
    }
  }
  dec() {
    this.refCount--;
    for (const listener of this.listeners) {
      listener(this.refCount);
    }
  }
}
interface MainCanvasPageLoadedData {
  width: number;
  height: number;
}
interface MainCanvas {
  scale: number;
  currentMainRef: PdfCanvasReference | undefined;
  canvasObject: CanvasObject;
  referenceManager: PdfCanvasReferenceManager;
  pageLoaded: Promise<MainCanvasPageLoadedData>;
  rendered: Promise<void>;
}
export default class PDF {
  document: PDFDocumentProxy;
  page?: PDFPageProxy;
  pageMap: Map<number, PDFPromise<PDFPageProxy>> = new Map();
  // tslint:disable-next-line: no-any
  operatorListMap: Map<number, PDFPromise<any[]>> = new Map();
  // tslint:disable-next-line: no-any
  gfxMap: Map<number, any> = new Map();
  svgMap: Map<number, SVGElement> = new Map();
  embedFontsSvgMap: Map<number, SVGElement> = new Map();
  textMap: Map<number, PDFPromise<TextContent>> = new Map();
  mainCanvasMap: Map<number, Set<MainCanvas>> = new Map();
  constructor(document: PDFDocumentProxy) {
    this.document = document;
  }
  async getPage(pageNumber: number): Promise<PDFPageProxy> {
    const cachedPage = this.pageMap.get(pageNumber);
    if (cachedPage !== undefined) return cachedPage;

    const loadedPage = this.document.getPage(pageNumber);
    this.pageMap.set(pageNumber, loadedPage);
    return loadedPage;
  }
  // tslint:disable-next-line: no-any
  async getOperatorList(pageNumber: number): Promise<any[]> {
    const cachedOperatorList = this.operatorListMap.get(pageNumber);
    if (cachedOperatorList !== undefined) return cachedOperatorList;
    const page = await this.getPage(pageNumber);
    // tslint:disable-next-line: no-any
    const operatorList = (page as any).getOperatorList();
    this.operatorListMap.set(pageNumber, operatorList);
    return operatorList;
  }
  // tslint:disable-next-line: no-any
  async getGfx(pageNumber: number): Promise<any> {
    const cachedGfx = this.gfxMap.get(pageNumber);
    if (cachedGfx !== undefined) return cachedGfx;

    const page = await this.getPage(pageNumber);
    // tslint:disable-next-line: no-any
    const gfx = new (pdfjs as any).SVGGraphics(
      // tslint:disable-next-line: no-any
      (page as any).commonObjs,
      // tslint:disable-next-line: no-any
      (page as any).objs,
    );
    this.gfxMap.set(pageNumber, gfx);
    return gfx;
  }
  async renderSvg(
    pageNumber: number,
    embedFonts: boolean,
  ): Promise<SVGElement> {
    if (embedFonts) {
      const cachedSvg = this.embedFontsSvgMap.get(pageNumber);
      if (cachedSvg !== undefined)
        return cachedSvg.cloneNode(true) as SVGElement;
    } else {
      const cachedSvg = this.svgMap.get(pageNumber);
      if (cachedSvg !== undefined)
        return cachedSvg.cloneNode(true) as SVGElement;
    }
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const operatorList = await this.getOperatorList(pageNumber);
    const gfx = await this.getGfx(pageNumber);
    gfx.embedFonts = embedFonts;
    const element = await gfx.getSVG(operatorList, viewport);
    if (embedFonts) {
      this.embedFontsSvgMap.set(pageNumber, element);
    } else {
      this.svgMap.set(pageNumber, element);
    }

    return element;
  }
  renderCanvas(
    referenceManager: PdfCanvasReferenceManager,
    canvasObject: CanvasObject,
    pageNumber: number,
    scale: number,
  ): [Promise<void>, Promise<void>] {
    const renderingReference = referenceManager.createRetainedRef();
    const pagePromise = this.getPage(pageNumber);
    const renderingPromise = (async () => {
      const page = await pagePromise;
      const viewport = page.getViewport({ scale });
      canvasObject.canvas.width = viewport.width;
      canvasObject.canvas.height = viewport.height;
      canvasObject.canvas.style.width = "100%";
      canvasObject.canvas.style.height = "100%";
      await page.render(({
        canvasContext: canvasObject.context,
        viewport,
        canvasFactory: globalFactory,
      } as unknown) as any).promise;
      renderingReference.release();
    })();

    return [
      (async () => {
        await pagePromise;
      })(),
      renderingPromise,
    ];
  }
  createMainCanvas(pageNumber: number, scale: number): MainCanvas {
    const canvasObject = globalFactory.create(undefined, undefined);
    const referenceManager = new PdfCanvasReferenceManager(0);
    const initialRef = referenceManager.createRetainedRef();
    const [loadPromise, renderingPromise] = this.renderCanvas(
      referenceManager,
      canvasObject,
      pageNumber,
      scale,
    );
    const mainCanvas: MainCanvas = {
      scale,
      currentMainRef: initialRef,
      canvasObject,
      referenceManager,
      pageLoaded: (async () => {
        await loadPromise;
        return {
          width: canvasObject.canvas.width,
          height: canvasObject.canvas.height,
        };
      })(),
      rendered: renderingPromise,
    };
    let timeout: number | undefined;
    initialRef.addListener(() => {
      mainCanvas.currentMainRef = undefined;
    });
    referenceManager.addListener((cnt: number) => {
      if (cnt < 0) {
        timeout = window.setTimeout(() => {
          globalFactory.destroy(canvasObject);
          const s = this.mainCanvasMap.get(pageNumber);
          if (s) {
            s.delete(mainCanvas);
          }
        }, 10000);
      } else {
        if (timeout) window.clearTimeout(timeout);
        timeout = undefined;
      }
    });
    return mainCanvas;
  }

  async renderCanvasSplit(
    pageNumber: number,
    scale: number,
    start: number,
    end: number,
  ): Promise<[HTMLCanvasElement, boolean, PdfCanvasReference]> {
    const mainCanvasSet = this.mainCanvasMap.get(pageNumber);
    let mainCanvas: MainCanvas | undefined;
    let isMainUser = false;
    if (mainCanvasSet) {
      for (const existingMainCanvas of mainCanvasSet) {
        if (
          existingMainCanvas.scale + 0.001 >= scale &&
          (mainCanvas === undefined || mainCanvas.currentMainRef !== undefined)
        ) {
          mainCanvas = existingMainCanvas;
        }
      }
      if (mainCanvas && mainCanvas.currentMainRef === undefined) {
        isMainUser = true;
        mainCanvas.currentMainRef = mainCanvas?.referenceManager.createRetainedRef();
      }
    }
    if (mainCanvas === undefined) {
      mainCanvas = this.createMainCanvas(pageNumber, scale);
      isMainUser = true;
      if (mainCanvasSet) {
        mainCanvasSet.add(mainCanvas);
      } else {
        this.mainCanvasMap.set(pageNumber, new Set([mainCanvas]));
      }
    }

    if (mainCanvas === undefined) throw new Error();
    const ref = isMainUser
      ? mainCanvas.currentMainRef!
      : mainCanvas.referenceManager.createRetainedRef();

    if (isMainUser) {
      ref.addListener(() => {
        if (mainCanvas === undefined) throw new Error();
        mainCanvas.currentMainRef = undefined;
      });
      return [mainCanvas.canvasObject.canvas, true, ref];
    } else {
      const mainRef = mainCanvas.referenceManager.createRetainedRef();
      const [pageSize, page] = await Promise.all([
        mainCanvas.pageLoaded,
        this.getPage(pageNumber),
        mainCanvas.rendered,
      ]);
      const viewport = page.getViewport({ scale });
      const width = viewport.width;
      const height = viewport.height * (end - start);
      const obj = globalFactory.create(width, height);
      obj.canvas.style.width = "100%";
      obj.canvas.style.height = "100%";
      const [sx, sy, sw, sh] = [
        0,
        pageSize.height * start,
        pageSize.width,
        (end - start) * pageSize.height,
      ];
      const [dx, dy, dw, dh] = [0, 0, width, height];
      const ctx = obj.context;
      if (ctx === null) throw new Error("Redering failed.");
      ctx.drawImage(
        mainCanvas.canvasObject.canvas,
        sx,
        sy,
        sw,
        sh,
        dx,
        dy,
        dw,
        dh,
      );
      ctx.fillStyle = "rgb(0, 159, 227)";
      ctx.beginPath();
      ctx.arc(20, 20, 10, 0, 2 * Math.PI, false);
      ctx.fill();
      const newManager = new PdfCanvasReferenceManager(0);
      const childRef = newManager.createRetainedRef();

      newManager.addListener((cnt: number) => {
        if (cnt <= 0) {
          mainRef.release();
          globalFactory.destroy(obj);
        }
      });

      return [obj.canvas, false, childRef];
    }
  }
  async renderText(pageNumber: number): Promise<TextContent> {
    const cachedPromise = this.textMap.get(pageNumber);
    if (cachedPromise !== undefined) return cachedPromise;
    const page = await this.getPage(pageNumber);
    const contentPromise = page.getTextContent();
    this.textMap.set(pageNumber, contentPromise);
    return contentPromise;
  }
}
