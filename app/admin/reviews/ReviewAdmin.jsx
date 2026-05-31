"use client";

import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

const emptyForm = {
  id: "",
  title: "",
  category: "수술 후기",
  breed: "",
  admissionDate: "",
  dischargeDate: "",
  body: "",
  imageUrls: [],
  coverImageUrl: "",
  published: false,
};

const maxUploadBytes = 3 * 1024 * 1024;
const maxImageEdge = 2000;
const thumbnailSize = 960;
const compressionQualities = [0.86, 0.78, 0.7, 0.62, 0.54, 0.46];
const csrfCookieName = "sams_admin_csrf";
const csrfWarningMessage = "보안 토큰을 가져오지 못했습니다. 새로고침 후 다시 시도해주세요.";
const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function fetchJsonWithRetry(url, options = {}, { retries = 2, delayMs = 350 } = {}) {
  let lastResult;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const payload = await response.json().catch(() => ({}));

      lastResult = { response, payload };

      if (response.ok || !retryableStatuses.has(response.status) || attempt === retries) {
        return lastResult;
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }

    await sleep(delayMs * (attempt + 1));
  }

  return lastResult;
}

function readCookieValue(name) {
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function getCsrfToken() {
  return readCookieValue(csrfCookieName);
}

function summarizeClientToken(token) {
  return {
    present: Boolean(token),
    length: token?.length || 0,
    prefix: token ? token.slice(0, 10) : "",
  };
}

function clientCookieDiagnostics() {
  const names = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter(Boolean);

  return {
    cookieHeaderPresent: Boolean(document.cookie),
    cookieNames: Array.from(new Set(names)),
    csrfCookieOccurrences: names.filter((name) => name === csrfCookieName).length,
    csrfToken: summarizeClientToken(getCsrfToken()),
  };
}

function formatBytes(bytes) {
  if (!bytes) {
    return "0MB";
  }

  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", ".");
}

function formatCreatedDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  })
    .format(date)
    .replaceAll(" ", "")
    .replace(/\.$/, "");
}

function dateRangeText(review) {
  if (review.admissionDate && review.dischargeDate) {
    return `${formatDate(review.admissionDate)} - ${formatDate(review.dischargeDate)}`;
  }

  if (review.admissionDate) {
    return `입원 ${formatDate(review.admissionDate)}`;
  }

  if (review.dischargeDate) {
    return `퇴원 ${formatDate(review.dischargeDate)}`;
  }

  return "";
}

function reviewImages(review) {
  return Array.isArray(review.imageUrls) && review.imageUrls.length > 0 ? review.imageUrls : [review.coverImageUrl].filter(Boolean);
}

function reviewThumbnail(review) {
  return review.coverImageUrl || reviewImages(review)[0] || "";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function centeredSquareCrop(width, height) {
  const size = Math.min(width, height);

  return {
    x: Math.round((width - size) / 2),
    y: Math.round((height - size) / 2),
    size,
  };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 읽지 못했습니다."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const image = await loadImage(file);
  const scale = Math.min(1, maxImageEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이미지 압축을 준비하지 못했습니다.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const outputTypes = ["image/webp", "image/jpeg"];

  for (const type of outputTypes) {
    for (const quality of compressionQualities) {
      const blob = await canvasToBlob(canvas, type, quality);

      if (!blob || blob.size > maxUploadBytes) {
        continue;
      }

      const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
      const baseName = file.name.replace(/\.[^.]+$/, "") || "review-image";

      return {
        file: new File([blob], `${baseName}.${extension}`, {
          type: blob.type || type,
          lastModified: Date.now(),
        }),
        originalSize: file.size,
        compressedSize: blob.size,
        dimensions: {
          width: canvas.width,
          height: canvas.height,
        },
      };
    }
  }

  throw new Error("이미지를 3MB 이하로 압축하지 못했습니다. 더 작은 사진을 선택해주세요.");
}

async function createThumbnailFile(file, crop) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const image = await loadImage(file);
  const fallbackCrop = centeredSquareCrop(image.naturalWidth, image.naturalHeight);
  const safeSize = clamp(Math.round(crop?.size || fallbackCrop.size), 1, Math.min(image.naturalWidth, image.naturalHeight));
  const safeCrop = {
    x: clamp(Math.round(crop?.x ?? fallbackCrop.x), 0, image.naturalWidth - safeSize),
    y: clamp(Math.round(crop?.y ?? fallbackCrop.y), 0, image.naturalHeight - safeSize),
    size: safeSize,
  };
  const canvas = document.createElement("canvas");

  canvas.width = thumbnailSize;
  canvas.height = thumbnailSize;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("썸네일 편집을 준비하지 못했습니다.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    safeCrop.x,
    safeCrop.y,
    safeCrop.size,
    safeCrop.size,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  for (const quality of compressionQualities) {
    const blob = await canvasToBlob(canvas, "image/webp", quality);

    if (!blob || blob.size > maxUploadBytes) {
      continue;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "review-thumbnail";

    return new File([blob], `${baseName}-thumbnail.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  }

  throw new Error("썸네일을 3MB 이하로 만들지 못했습니다. 다른 사진을 선택해주세요.");
}

function statusLabel(value) {
  if (value === true) {
    return "정상";
  }

  if (value === false) {
    return "확인 필요";
  }

  return "확인 중";
}

function StatusBadge({ ok }) {
  const className = ok === true ? "is-ok" : ok === false ? "is-bad" : "is-warn";

  return <span className={`admin-debug-status ${className}`}>{statusLabel(ok)}</span>;
}

function DebugItem({ label, ok, children }) {
  return (
    <div className="admin-debug-item">
      <div>
        <strong>{label}</strong>
        <StatusBadge ok={ok} />
      </div>
      <p>{children}</p>
    </div>
  );
}

function requestSummary(request) {
  if (!request) {
    return "아직 확인 전입니다.";
  }

  if (request.error) {
    return `${request.label}: 실패 (${request.error})`;
  }

  if (!request.status) {
    return "아직 확인 전입니다.";
  }

  return `${request.label}: HTTP ${request.status}`;
}

function DiagnosticsPanel({ diagnostics, isLoading, onRefresh }) {
  const client = diagnostics?.client;
  const server = diagnostics?.serverDebug?.payload;
  const csrfApi = diagnostics?.csrfApi;
  const adminReviews = diagnostics?.adminReviews;
  const csrfResponseOk = csrfApi?.ok === true && client?.after?.csrfToken.present;
  const debugResponseOk = diagnostics?.serverDebug?.ok === true;
  const dbOk = server?.storage?.databaseReachable;
  const serverHeaderOk = server?.csrf?.header.valid;
  const serverCookieOk = server?.csrf?.cookie.valid;
  const reviewFetchOk = adminReviews?.ok === true;

  return (
    <section className="admin-debug-panel" aria-label="관리 진단">
      <div className="admin-debug-heading">
        <div>
          <h2>관리 진단</h2>
          <p>현재 브라우저 쿠키, CSRF 발급, 서버 검증, DB 조회 상태를 함께 확인합니다.</p>
        </div>
        <button className="admin-button is-secondary" disabled={isLoading} onClick={onRefresh} type="button">
          {isLoading ? "확인 중" : "진단 새로고침"}
        </button>
      </div>

      <div className="admin-debug-grid">
        <DebugItem label="브라우저 CSRF 쿠키" ok={client?.after?.csrfToken.present}>
          {client?.after?.csrfToken.present
            ? `${client.after.csrfCookieOccurrences}개 감지 · ${client.after.csrfToken.length}자 · ${client.after.csrfToken.prefix}...`
            : "현재 탭에서 CSRF 쿠키를 읽지 못했습니다."}
        </DebugItem>
        <DebugItem label="CSRF API" ok={csrfResponseOk}>
          {requestSummary(csrfApi)}
          {csrfApi?.token?.present ? ` · ${csrfApi.token.length}자 · ${csrfApi.token.prefix}...` : ""}
        </DebugItem>
        <DebugItem label="서버 CSRF 헤더" ok={serverHeaderOk}>
          {debugResponseOk
            ? server?.csrf?.header.present
              ? `${server.csrf.header.length}자 · ${server.csrf.header.prefix}... · 서버 검증 ${server.csrf.header.valid ? "통과" : "실패"}`
              : "서버가 x-csrf-token 헤더를 받지 못했습니다."
            : requestSummary(diagnostics?.serverDebug)}
        </DebugItem>
        <DebugItem label="서버 CSRF 쿠키" ok={serverCookieOk}>
          {debugResponseOk
            ? `${server.csrf.csrfCookieOccurrences}개 감지 · ${server.csrf.cookie.present ? `${server.csrf.cookie.length}자 · ${server.csrf.cookie.prefix}...` : "쿠키 없음"}`
            : requestSummary(diagnostics?.serverDebug)}
        </DebugItem>
        <DebugItem label="관리 API 목록" ok={reviewFetchOk}>
          {reviewFetchOk ? `수술 후기 ${adminReviews.count}개 조회됨` : requestSummary(adminReviews)}
        </DebugItem>
        <DebugItem label="DB 연결" ok={dbOk}>
          {debugResponseOk
            ? dbOk
              ? `DB 조회 가능 · 서버 기준 ${server.storage.reviewCount}개`
              : `DB 오류: ${server.storage.databaseError}`
            : requestSummary(diagnostics?.serverDebug)}
        </DebugItem>
      </div>

      <dl className="admin-debug-meta">
        <div>
          <dt>확인 시각</dt>
          <dd>{diagnostics?.checkedAt || "대기 중"}</dd>
        </div>
        <div>
          <dt>관리자</dt>
          <dd>{server?.admin?.email || "확인 전"}</dd>
        </div>
        <div>
          <dt>인증 우회</dt>
          <dd>{server?.environment ? (server.environment.authDisabled ? "켜짐" : "꺼짐") : "확인 전"}</dd>
        </div>
        <div>
          <dt>Blob 설정</dt>
          <dd>{server?.environment ? (server.environment.blobConfigured ? "있음" : "없음") : "확인 전"}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function ReviewAdmin({ initialReviews, adminEmail }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [form, setForm] = useState(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileNote, setFileNote] = useState("");
  const [cropImage, setCropImage] = useState(null);
  const [cropDraft, setCropDraft] = useState(null);
  const [thumbnailCrop, setThumbnailCrop] = useState(null);
  const [cropDrag, setCropDrag] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [diagnostics, setDiagnostics] = useState(null);
  const [isDiagnosticsLoading, setIsDiagnosticsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const cropStageRef = useRef(null);
  const fileInputRef = useRef(null);

  const refreshCsrfToken = async () => {
    const { response, payload } = await fetchJsonWithRetry("/api/admin/csrf", {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok || !payload.csrfToken) {
      const cookieToken = getCsrfToken();

      if (cookieToken) {
        return cookieToken;
      }

      throw new Error(csrfWarningMessage);
    }

    setCsrfToken(payload.csrfToken);

    return payload.csrfToken;
  };

  const fetchWithCsrf = async (url, options = {}) => {
    const makeRequest = async (token) =>
      fetch(url, {
        ...options,
        credentials: "same-origin",
        headers: {
          ...(options.headers || {}),
          "x-csrf-token": token,
        },
      });
    let token = getCsrfToken() || csrfToken || (await refreshCsrfToken());
    let response = await makeRequest(token);

    if (response.status === 403) {
      const result = await response.clone().json().catch(() => ({}));

      if (result.error === "Invalid CSRF token.") {
        token = await refreshCsrfToken();
        response = await makeRequest(token);
      }
    }

    return response;
  };

  const refreshDiagnostics = async () => {
    setIsDiagnosticsLoading(true);

    const nextDiagnostics = {
      checkedAt: new Date().toLocaleString("ko-KR"),
      client: {
        before: clientCookieDiagnostics(),
      },
      csrfApi: {
        label: "/api/admin/csrf",
        ok: null,
        status: null,
        token: summarizeClientToken(""),
      },
      serverDebug: {
        label: "/api/admin/debug",
        ok: null,
        status: null,
      },
      adminReviews: {
        label: "/api/admin/reviews",
        ok: null,
        status: null,
        count: 0,
      },
    };

    let token = getCsrfToken() || csrfToken || "";

    try {
      const { response, payload } = await fetchJsonWithRetry("/api/admin/csrf", {
        cache: "no-store",
        credentials: "same-origin",
      });

      nextDiagnostics.csrfApi = {
        ...nextDiagnostics.csrfApi,
        ok: response.ok && Boolean(payload.csrfToken),
        status: response.status,
        token: summarizeClientToken(payload.csrfToken),
      };

      if (payload.csrfToken) {
        token = payload.csrfToken;
        setCsrfToken(payload.csrfToken);
      }
    } catch (error) {
      nextDiagnostics.csrfApi = {
        ...nextDiagnostics.csrfApi,
        ok: false,
        error: error.message,
      };
    }

    nextDiagnostics.client.after = clientCookieDiagnostics();

    try {
      const response = await fetch("/api/admin/debug", {
        cache: "no-store",
        credentials: "same-origin",
        headers: token ? { "x-csrf-token": token } : {},
      });
      const payload = await response.json().catch(() => ({}));

      nextDiagnostics.serverDebug = {
        ...nextDiagnostics.serverDebug,
        ok: response.ok,
        status: response.status,
        payload,
      };
    } catch (error) {
      nextDiagnostics.serverDebug = {
        ...nextDiagnostics.serverDebug,
        ok: false,
        error: error.message,
      };
    }

    try {
      const response = await fetch("/api/admin/reviews", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const payload = await response.json().catch(() => ({}));

      nextDiagnostics.adminReviews = {
        ...nextDiagnostics.adminReviews,
        ok: response.ok && Array.isArray(payload.reviews),
        status: response.status,
        count: Array.isArray(payload.reviews) ? payload.reviews.length : 0,
      };
    } catch (error) {
      nextDiagnostics.adminReviews = {
        ...nextDiagnostics.adminReviews,
        ok: false,
        error: error.message,
      };
    }

    setDiagnostics(nextDiagnostics);
    setIsDiagnosticsLoading(false);
  };

  useEffect(() => {
    const objectUrl = cropImage?.url;

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [cropImage?.url]);

  useEffect(() => {
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      refreshCsrfToken(),
      fetch("/api/admin/reviews", {
        cache: "no-store",
        credentials: "same-origin",
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => {
          if (isMounted && Array.isArray(payload?.reviews)) {
            setReviews(payload.reviews);
            setMessage((current) => (current === csrfWarningMessage ? "" : current));
          }
        }),
    ]).catch(() => {
      // Mutating requests refresh and validate CSRF again. Avoid leaving a stale
      // page-level warning on long-lived admin tabs when the initial warm-up fails.
    });
    refreshDiagnostics();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
      ),
    [reviews],
  );

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadImages = async () => {
    if (files.length === 0) {
      return {
        imageUrls: reviewImages(form),
        coverImageUrl: reviewThumbnail(form),
      };
    }

    const uploadedUrls = [];
    let originalSize = 0;
    let compressedSize = 0;

    const thumbnailFile = await createThumbnailFile(files[0], thumbnailCrop);
    const thumbnailUrl = await uploadImageFile(thumbnailFile);
    compressedSize += thumbnailFile.size;

    for (const selectedFile of files) {
      const optimized = await compressImage(selectedFile);
      originalSize += optimized.originalSize;
      compressedSize += optimized.compressedSize;
      uploadedUrls.push(await uploadImageFile(optimized.file));
    }

    setFileNote(
      `${files.length}장 이미지와 정사각형 썸네일을 ${formatBytes(originalSize)}에서 ${formatBytes(compressedSize)}로 최적화했습니다.`,
    );

    return {
      imageUrls: uploadedUrls,
      coverImageUrl: thumbnailUrl,
    };
  };

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithCsrf("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "이미지 업로드에 실패했습니다.");
    }

    return result.url;
  };

  const openThumbnailEditor = (selectedFiles) => {
    const firstFile = selectedFiles[0];

    if (!firstFile) {
      setCropImage(null);
      setCropDraft(null);
      setThumbnailCrop(null);
      return;
    }

    const objectUrl = URL.createObjectURL(firstFile);
    const image = new Image();

    image.onload = () => {
      const crop = centeredSquareCrop(image.naturalWidth, image.naturalHeight);

      setCropImage({
        fileName: firstFile.name,
        url: objectUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setCropDraft(crop);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setMessage("썸네일 편집용 이미지를 읽지 못했습니다.");
    };
    image.src = objectUrl;
  };

  const closeThumbnailEditor = () => {
    setCropImage(null);
    setCropDrag(null);
  };

  const applyThumbnailCrop = () => {
    setThumbnailCrop(cropDraft);
    setFileNote((current) => `${current || "이미지가 선택되었습니다."} 썸네일 영역을 적용했습니다.`);
    closeThumbnailEditor();
  };

  const moveCrop = (nextX, nextY, nextSize = cropDraft?.size) => {
    if (!cropDraft || !cropImage || !nextSize) {
      return;
    }

    const size = clamp(nextSize, 1, Math.min(cropImage.width, cropImage.height));

    setCropDraft({
      x: Math.round(clamp(nextX, 0, cropImage.width - size)),
      y: Math.round(clamp(nextY, 0, cropImage.height - size)),
      size: Math.round(size),
    });
  };

  const resizeCrop = (zoom) => {
    if (!cropDraft || !cropImage) {
      return;
    }

    const maxSize = Math.min(cropImage.width, cropImage.height);
    const nextSize = maxSize / Number(zoom);
    const centerX = cropDraft.x + cropDraft.size / 2;
    const centerY = cropDraft.y + cropDraft.size / 2;

    moveCrop(centerX - nextSize / 2, centerY - nextSize / 2, nextSize);
  };

  const cropStyle = cropImage && cropDraft
    ? {
        left: `${(cropDraft.x / cropImage.width) * 100}%`,
        top: `${(cropDraft.y / cropImage.height) * 100}%`,
        width: `${(cropDraft.size / cropImage.width) * 100}%`,
        height: `${(cropDraft.size / cropImage.height) * 100}%`,
      }
    : {};

  const saveReview = async (event) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    try {
      if (
        form.admissionDate &&
        form.dischargeDate &&
        new Date(form.admissionDate).getTime() > new Date(form.dischargeDate).getTime()
      ) {
        throw new Error("퇴원일은 입원일과 같거나 이후여야 합니다.");
      }

      const { imageUrls, coverImageUrl } = await uploadImages();
      const payload = {
        title: form.title,
        category: form.category,
        breed: form.breed,
        admissionDate: form.admissionDate,
        dischargeDate: form.dischargeDate,
        body: form.body,
        imageUrls,
        coverImageUrl,
        published: form.published,
      };
      const isEditing = Boolean(form.id);
      const response = await fetchWithCsrf(isEditing ? `/api/admin/reviews/${form.id}` : "/api/admin/reviews", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "저장에 실패했습니다.");
      }

      setReviews((current) =>
        isEditing
          ? current.map((review) => (review.id === result.review.id ? result.review : review))
          : [result.review, ...current],
      );
      setForm(emptyForm);
      setFiles([]);
      setFileNote("");
      setThumbnailCrop(null);
      closeThumbnailEditor();
      setIsEditorOpen(false);
      setMessage(isEditing ? "수술 후기를 수정했습니다." : "수술 후기를 저장했습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const editReview = (review) => {
    setForm({
      id: review.id,
      title: review.title,
      category: review.category,
      breed: review.breed || "",
      admissionDate: review.admissionDate || "",
      dischargeDate: review.dischargeDate || "",
      body: review.body,
      imageUrls: reviewImages(review),
      coverImageUrl: reviewThumbnail(review),
      published: review.published,
    });
    setFiles([]);
    setFileNote("");
    setThumbnailCrop(null);
    closeThumbnailEditor();
    setIsEditorOpen(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteReviewById = async (id) => {
    setIsPending(true);
    setMessage("");

    try {
      const response = await fetchWithCsrf(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "삭제에 실패했습니다.");
      }

      setReviews((current) => current.filter((review) => review.id !== id));
      setMessage("수술 후기를 삭제했습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const clearForm = () => {
    setForm(emptyForm);
    setIsEditorOpen(false);
    setFiles([]);
    setFileNote("");
    setThumbnailCrop(null);
    closeThumbnailEditor();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startNewReview = () => {
    setForm(emptyForm);
    setFiles([]);
    setFileNote("");
    setThumbnailCrop(null);
    closeThumbnailEditor();
    setIsEditorOpen(true);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div>
            <h1>수술 후기 관리</h1>
            <p>{adminEmail}</p>
          </div>
          <div className="admin-actions">
            <button className="admin-button" onClick={startNewReview} type="button">
              글 추가
            </button>
            <a className="admin-button is-secondary" href="/reviews">
              공개 화면
            </a>
            <button className="admin-button is-secondary" onClick={logout} type="button">
              로그아웃
            </button>
          </div>
        </div>

        <DiagnosticsPanel diagnostics={diagnostics} isLoading={isDiagnosticsLoading} onRefresh={refreshDiagnostics} />

        {isEditorOpen ? (
          <form className="admin-review-form" onSubmit={saveReview}>
            <div className="admin-form-heading">
              <h2>{form.id ? "수술 후기 수정" : "새 수술 후기 작성"}</h2>
            </div>
            <label>
              제목
              <input maxLength={120} onChange={updateField("title")} required value={form.title} />
            </label>
            <label>
              수술 종류
              <input maxLength={40} onChange={updateField("category")} placeholder="예: 슬개골탈구, 십자인대, 골절" required value={form.category} />
            </label>
            <label>
              견종 <span className="admin-optional">(선택)</span>
              <input maxLength={60} onChange={updateField("breed")} placeholder="예: 말티즈, 푸들, 골든리트리버" value={form.breed} />
            </label>
            <div className="admin-date-row">
              <label>
                입원일 <span className="admin-optional">(선택)</span>
                <input onChange={updateField("admissionDate")} type="date" value={form.admissionDate} />
              </label>
              <label>
                퇴원일 <span className="admin-optional">(선택)</span>
                <input onChange={updateField("dischargeDate")} type="date" value={form.dischargeDate} />
              </label>
            </div>
            <label className="is-wide">
              본문
              <textarea maxLength={5000} onChange={updateField("body")} required value={form.body} />
            </label>
            <div className="admin-image-field is-wide">
              <span className="admin-field-label">
                수술 후기 이미지 <span className="admin-optional">(선택, 여러 장 가능)</span>
              </span>
              {reviewThumbnail(form) ? (
                <figure className="admin-thumbnail-preview-card">
                  <img className="admin-thumbnail-preview" alt="게시판 썸네일 미리보기" src={reviewThumbnail(form)} />
                  <figcaption>게시판 썸네일</figcaption>
                </figure>
              ) : null}
              {reviewImages(form).length > 0 ? (
                <div className="admin-image-preview-grid">
                  {reviewImages(form).map((imageUrl, index) => (
                    <figure key={imageUrl}>
                      <img className="admin-image-preview" alt={`수술 후기 이미지 ${index + 1}`} src={imageUrl} />
                      {index === 0 ? <figcaption>첫 번째 이미지</figcaption> : null}
                    </figure>
                  ))}
                </div>
              ) : null}
              {filePreviews.length > 0 ? (
                <div className="admin-selected-preview-grid" aria-label="선택한 이미지 미리보기">
                  {filePreviews.map((preview, index) => (
                    <figure key={`${preview.name}-${preview.url}`}>
                      <img alt={`선택한 이미지 ${index + 1}`} src={preview.url} />
                      <figcaption>{index === 0 ? "썸네일 대상" : preview.name}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
              <button className="admin-button is-secondary admin-add-image-button" onClick={() => fileInputRef.current?.click()} type="button">
                이미지 추가
              </button>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="admin-hidden-file-input"
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files || []);

                  setFiles(selectedFiles);
                  setThumbnailCrop(null);
                  setFileNote(
                    selectedFiles.length > 0
                      ? `${selectedFiles.length}장 선택됨. 저장 시 각 이미지를 3MB 이하로 자동 최적화하고, 첫 번째 사진으로 정사각형 썸네일을 만듭니다.`
                      : "",
                  );
                  openThumbnailEditor(selectedFiles);
                }}
                multiple
                ref={fileInputRef}
                type="file"
              />
              <span className="admin-field-note">여러 장을 선택할 수 있고, 첫 번째 사진에서 정사각형 썸네일 영역을 지정합니다.</span>
              {fileNote ? <span className="admin-file-note">{fileNote}</span> : null}
            </div>
            <label>
              공개 상태
              <select onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === "true" }))} value={String(form.published)}>
                <option value="false">임시저장</option>
                <option value="true">공개</option>
              </select>
            </label>
            <div className="admin-actions">
              <button className="admin-button" disabled={isPending} type="submit">
                저장
              </button>
              <button className="admin-button is-secondary" onClick={clearForm} type="button">
                취소
              </button>
            </div>
          </form>
        ) : null}

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="admin-list" aria-label="저장된 수술 후기">
          <div className="admin-list-heading">
            <h2>작성된 수술 후기</h2>
            <button className="admin-button" onClick={startNewReview} type="button">
              글 추가
            </button>
          </div>
          {sortedReviews.length > 0 ? sortedReviews.map((review) => (
            <article key={review.id}>
              <div>
                <h2>{review.title}</h2>
                <p>
                  {review.category}
                  {review.breed ? ` · ${review.breed}` : ""} · {review.published ? "공개" : "임시저장"}
                  {formatCreatedDate(review.createdAt) ? ` · 작성일 ${formatCreatedDate(review.createdAt)}` : ""}
                  {dateRangeText(review) ? ` · ${dateRangeText(review)}` : ""}
                </p>
              </div>
              <div className="admin-actions">
                <button className="admin-button is-secondary" onClick={() => editReview(review)} type="button">
                  수정
                </button>
                <button className="admin-button is-secondary" disabled={isPending} onClick={() => deleteReviewById(review.id)} type="button">
                  삭제
                </button>
              </div>
            </article>
          )) : <p className="admin-empty">아직 작성된 수술 후기가 없습니다.</p>}
        </section>
      </div>
      {cropImage && cropDraft ? (
        <div className="admin-crop-modal" role="dialog" aria-modal="true" aria-label="썸네일 편집">
          <div className="admin-crop-panel">
            <div className="admin-crop-panel__header">
              <div>
                <h2>썸네일 편집</h2>
                <p>{cropImage.fileName}</p>
              </div>
            </div>
            <div className="admin-crop-workspace">
              <div
                className="admin-crop-stage"
                ref={cropStageRef}
                style={{
                  "--crop-image-ratio": `${cropImage.width} / ${cropImage.height}`,
                  "--crop-stage-width": `${(cropImage.width / cropImage.height) * 62}vh`,
                }}
              >
                <img alt="썸네일로 자를 원본 이미지" src={cropImage.url} />
                <div className="admin-crop-shade is-top" style={{ height: cropStyle.top }} />
                <div
                  className="admin-crop-shade is-bottom"
                  style={{ top: `calc(${cropStyle.top} + ${cropStyle.height})`, height: `calc(100% - ${cropStyle.top} - ${cropStyle.height})` }}
                />
                <div className="admin-crop-shade is-left" style={{ top: cropStyle.top, width: cropStyle.left, height: cropStyle.height }} />
                <div
                  className="admin-crop-shade is-right"
                  style={{
                    top: cropStyle.top,
                    left: `calc(${cropStyle.left} + ${cropStyle.width})`,
                    width: `calc(100% - ${cropStyle.left} - ${cropStyle.width})`,
                    height: cropStyle.height,
                  }}
                />
                <div
                  className="admin-crop-box"
                  onPointerDown={(event) => {
                    const stage = cropStageRef.current?.getBoundingClientRect();

                    if (!stage) {
                      return;
                    }

                    const pointerX = ((event.clientX - stage.left) / stage.width) * cropImage.width;
                    const pointerY = ((event.clientY - stage.top) / stage.height) * cropImage.height;

                    event.currentTarget.setPointerCapture(event.pointerId);
                    setCropDrag({
                      pointerId: event.pointerId,
                      offsetX: pointerX - cropDraft.x,
                      offsetY: pointerY - cropDraft.y,
                    });
                  }}
                  onPointerMove={(event) => {
                    if (!cropDrag || cropDrag.pointerId !== event.pointerId) {
                      return;
                    }

                    const stage = cropStageRef.current?.getBoundingClientRect();

                    if (!stage) {
                      return;
                    }

                    const pointerX = ((event.clientX - stage.left) / stage.width) * cropImage.width;
                    const pointerY = ((event.clientY - stage.top) / stage.height) * cropImage.height;

                    moveCrop(pointerX - cropDrag.offsetX, pointerY - cropDrag.offsetY);
                  }}
                  onPointerUp={() => setCropDrag(null)}
                  style={cropStyle}
                  role="presentation"
                >
                  <span />
                  <span />
                </div>
              </div>
              <aside className="admin-crop-sidebar">
                <div>
                  <h3>게시판에 보일 영역</h3>
                  <div className="admin-crop-preview">
                    <img
                      alt="정사각형 썸네일 미리보기"
                      src={cropImage.url}
                      style={{
                        width: `${(cropImage.width / cropDraft.size) * 100}%`,
                        height: `${(cropImage.height / cropDraft.size) * 100}%`,
                        transform: `translate(-${(cropDraft.x / cropImage.width) * 100}%, -${(cropDraft.y / cropImage.height) * 100}%)`,
                      }}
                    />
                  </div>
                </div>
                <label className="admin-crop-range">
                  썸네일 확대
                  <input
                    max="2.8"
                    min="1"
                    onChange={(event) => resizeCrop(event.target.value)}
                    step="0.01"
                    type="range"
                    value={(Math.min(cropImage.width, cropImage.height) / cropDraft.size).toFixed(2)}
                  />
                </label>
                <div className="admin-actions">
                  <button className="admin-button is-secondary" onClick={closeThumbnailEditor} type="button">
                    취소
                  </button>
                  <button
                    className="admin-button is-secondary"
                    onClick={() => {
                      const crop = centeredSquareCrop(cropImage.width, cropImage.height);
                      setCropDraft(crop);
                    }}
                    type="button"
                  >
                    가운데 맞춤
                  </button>
                  <button className="admin-button" onClick={applyThumbnailCrop} type="button">
                    저장
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
