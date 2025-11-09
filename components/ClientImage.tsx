"use client"

import React, { useEffect, useState, useRef } from 'react'

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null | Blob
  fallback?: string
}

export default function ClientImage({ src, fallback = '/default-course-thumbnail.svg', alt = '', ...rest }: Props) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(() => (typeof src === 'string' ? src : undefined))
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // Clean up previous object URL if any
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    if (typeof src === 'string') {
      setImgSrc(src)
      return
    }

    if (src instanceof Blob) {
      const url = URL.createObjectURL(src)
      objectUrlRef.current = url
      setImgSrc(url)
      return () => {
        // revoke when src (blob) changes or component unmounts
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
          objectUrlRef.current = null
        }
      }
    }

    // null or unsupported -> clear to fall back
    setImgSrc(undefined)
    return
  }, [src])

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={imgSrc || fallback}
      alt={alt}
      onError={(e) => {
        const t = e.currentTarget as HTMLImageElement
        if (t.src.endsWith(fallback)) return
        t.onerror = null
        setImgSrc(fallback)
      }}
      // default to lazy loading and async decoding when consumer doesn't set them
      loading={rest.loading ?? 'lazy'}
      decoding={rest.decoding ?? 'async'}
      fetchPriority={rest.fetchPriority ?? 'auto'}
      {...rest}
    />
  )
}
