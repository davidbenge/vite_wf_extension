import React, { useRef } from "react";

interface IframeWrapperProps {
  src: string;
  title: string;
}

const IframeWrapper: React.FC<IframeWrapperProps> = ({ src, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      data-uix-guest="true"
      role="presentation"
      referrerPolicy="no-referrer"
      aria-hidden="true"
      ref={iframeRef}
      src={src}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
      title={title}
    />
  );
};

export default IframeWrapper;
