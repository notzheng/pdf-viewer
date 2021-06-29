import React from "react";

import { Empty, message, Pagination, Progress } from "antd";

import { Spin } from "antd";

import * as pdfjs from "pdfjs-dist/es5/build/pdf";
//@ts-ignore
import pdfjsWorker from "pdfjs-dist/es5/build/pdf.worker.entry";
import {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/display/api";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface IViewerProps {
  fileUrl: string;
  onLoadingDone(): void;
}

const Viewer: React.FC<IViewerProps> = ({ fileUrl, onLoadingDone }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [pageLoading, setPageLoading] = React.useState(false);

  const pdfDocRef = React.useRef<PDFDocumentProxy>();

  const [currentUrl, setCurrentUrl] = React.useState("");

  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);

  const [downloadLoading, setDownloadLoading] = React.useState(false);

  const [downloadFailed, setDownloadFailed] = React.useState(false);

  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    setCurrentUrl(fileUrl);
  }, [fileUrl]);

  const handleRenderPage = React.useCallback((page) => {
    if (!pdfDocRef.current) {
      return;
    }
    console.log("loading");
    setPageLoading(true);
    pdfDocRef.current
      .getPage(page)
      .then((pdfPage) => {
        if (!canvasRef.current) {
          return;
        }

        const viewport = pdfPage.getViewport({ scale: 1 });

        canvasRef.current.height = viewport.height;
        canvasRef.current.width = viewport.width;

        const renderContext: RenderParameters = {
          canvasContext: canvasRef.current.getContext("2d")!,
          viewport,
        };
        return pdfPage.render(renderContext).promise.then(() => {
          console.log("ok");
          setCurrentPage(page);
        });
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, []);

  React.useLayoutEffect(() => {
    if (!currentUrl) {
      return;
    }

    setDownloadLoading(true);
    setDownloadFailed(false);
    const loadingTask = pdfjs.getDocument(currentUrl);

    loadingTask.onProgress = (res: any) => {
      const { loaded, total } = res;
      setPercent(Number(((loaded / total) * 100).toFixed(2)));
    };

    loadingTask.promise
      .then((pdf) => {
        console.log(pdf.getDownloadInfo());
        setDownloadLoading(false);
        console.log({ pages: pdf.numPages });
        setTotalPages(pdf.numPages);
        pdfDocRef.current = pdf;
        handleRenderPage(1);
      })
      .catch((e) => {
        console.log(e);
        setDownloadFailed(true);
        message.error("加载出错，请检查 Url");
      })
      .finally(() => {
        setDownloadLoading(false);
        onLoadingDone();
      });
  }, [currentUrl, handleRenderPage, onLoadingDone]);

  const handlePageChange = React.useCallback(
    (page) => {
      handleRenderPage(page);
    },
    [handleRenderPage]
  );

  if (!currentUrl) {
    return <Empty description="请加载文件" />;
  }

  if (downloadLoading) {
    return <Progress type="circle" percent={percent} />;
  }

  if (downloadFailed) {
    return <Progress type="circle" percent={65} status="exception" />;
  }

  return (
    <Spin size="large" spinning={pageLoading} tip="正在加载页面">
      <section className="viewer">
        <header className="filename">当前文件：{currentUrl}</header>
        <section className="pagination">
          <Pagination
            simple
            pageSize={1}
            current={currentPage}
            total={totalPages}
            onChange={handlePageChange}
          />
        </section>
        <section className="stage">
          <canvas className="canvas" ref={canvasRef}></canvas>
        </section>
      </section>
    </Spin>
  );
};

export default Viewer;
