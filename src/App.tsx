import React from "react";
import { Input, Typography } from "antd";
import Viewer from "./Viewer";

const DEFAULT_FILE_URL =
  "https://file.yzcdn.cn/upload_files/yz-file/2021/06/29/ltUArMvTMmywWBRSA3iyeWjxV9EH.pdf";

interface IFileUrlInputProps {
  onChange(v: string): void;
  loading: boolean;
}

const FileUrlInput: React.FC<IFileUrlInputProps> = ({ loading, onChange }) => {
  return (
    <Input.Search
      placeholder="输入文件链接"
      enterButton="加载文件"
      defaultValue={DEFAULT_FILE_URL}
      loading={loading}
      onSearch={onChange}
    />
  );
};

function App() {
  const [currentFileUrl, setCurrentFileUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const handleChange = React.useCallback(
    (value) => {
      if (value === currentFileUrl) {
        return;
      }
      setLoading(true);
      setCurrentFileUrl(value);
    },
    [currentFileUrl]
  );

  const handleLoadingDone = React.useCallback(() => {
    setLoading(false);
  }, []);
  return (
    <React.Fragment>
      <header className="header">
        <Typography.Title>Pdf 查看器</Typography.Title>
      </header>
      <section className="input">
        <FileUrlInput onChange={handleChange} loading={loading} />
      </section>
      <main className="main">
        <Viewer fileUrl={currentFileUrl} onLoadingDone={handleLoadingDone} />
      </main>
    </React.Fragment>
  );
}

export default App;
