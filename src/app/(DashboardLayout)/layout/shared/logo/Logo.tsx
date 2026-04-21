'use client'
import config from '@/app/context/config';
import { CustomizerContext } from "@/app/context/customizerContext";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '40px' : '180px',
    overflow: "hidden",
    display: "block",
    position: "relative",
    flexShrink: 0,
  }));

  const imageSx = {
    objectFit: 'contain' as const,
    objectPosition: 'left center',
  };

  const isShrunk = isCollapse === "mini-sidebar" && !isSidebarHover;

  if (activeDir === "ltr") {
    const logoSrc = isShrunk
      ? "/images/logos/logo-small.png"
      : activeMode === "dark"
        ? "/images/logos/valdo_logo.png"
        : "/images/logos/logo.png";
    return (
      <LinkStyled href="/">
        <Image
          src={logoSrc}
          alt="logo"
          fill
          priority
          style={imageSx}
          sizes={isShrunk ? "40px" : "(max-width: 40px) 40px, 180px"}
        />
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      <Image
        src={isShrunk ? "/images/logos/logo-small.png" : activeMode === "dark" ? "/images/logos/dark-rtl-logo.svg" : "/images/logos/logo.svg"}
        alt="logo"
        fill
        priority
        style={imageSx}
        sizes={isShrunk ? "40px" : "174px"}
      />
    </LinkStyled>
  );
};

export default Logo;
