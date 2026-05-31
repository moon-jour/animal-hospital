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

function getCsrfToken() {
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("sams_admin_csrf="))
    ?.split("=")[1];
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

export default function ReviewAdmin({ initialReviews, adminEmail }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [fileNote, setFileNote] = useState("");
  const [cropImage, setCropImage] = useState(null);
  const [cropDraft, setCropDraft] = useState(null);
  const [thumbnailCrop, setThumbnailCrop] = useState(null);
  const [cropDrag, setCropDrag] = useState(null);
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [isPending, setIsPending] = useState(false);
  const cropStageRef = useRef(null);

  useEffect(() => {
    const objectUrl = cropImage?.url;

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [cropImage?.url]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/admin/csrf")
      .then((response) => response.json())
      .then((payload) => {
        if (isMounted && payload.csrfToken) {
          setCsrfToken(payload.csrfToken);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMessage("보안 토큰을 가져오지 못했습니다. 새로고침 후 다시 시도해주세요.");
        }
      });

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

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { "x-csrf-token": csrfToken || getCsrfToken() || "" },
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
      setThumbnailCrop(crop);
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
      const response = await fetch(isEditing ? `/api/admin/reviews/${form.id}` : "/api/admin/reviews", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || getCsrfToken() || "",
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
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteReviewById = async (id) => {
    setIsPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken || getCsrfToken() || "" },
      });
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

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div>
            <h1>수술 후기 관리</h1>
            <p>{adminEmail}</p>
          </div>
          <div className="admin-actions">
            <a className="admin-button is-secondary" href="/reviews">
              공개 화면
            </a>
            <button className="admin-button is-secondary" onClick={logout} type="button">
              로그아웃
            </button>
          </div>
        </div>

        <form className="admin-review-form" onSubmit={saveReview}>
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
          <label className="admin-image-field is-wide">
            수술 후기 이미지 <span className="admin-optional">(선택, 여러 장 가능)</span>
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
            <input
              accept="image/jpeg,image/png,image/webp"
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
              type="file"
            />
            <span className="admin-field-note">여러 장을 선택할 수 있고, 첫 번째 사진에서 정사각형 썸네일 영역을 지정합니다.</span>
            {files.length > 0 ? (
              <button className="admin-button is-secondary admin-crop-button" onClick={() => openThumbnailEditor(files)} type="button">
                썸네일 영역 다시 조정
              </button>
            ) : null}
            {fileNote ? <span className="admin-file-note">{fileNote}</span> : null}
          </label>
          <label>
            공개 상태
            <select onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === "true" }))} value={String(form.published)}>
              <option value="false">임시저장</option>
              <option value="true">공개</option>
            </select>
          </label>
          <div className="admin-actions">
            <button className="admin-button" disabled={isPending} type="submit">
              {form.id ? "수정 저장" : "새 후기 저장"}
            </button>
            <button
              className="admin-button is-secondary"
              onClick={() => {
                setForm(emptyForm);
                setFiles([]);
                setFileNote("");
                setThumbnailCrop(null);
                closeThumbnailEditor();
              }}
              type="button"
            >
              새 글 작성
            </button>
          </div>
        </form>

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="admin-list" aria-label="저장된 수술 후기">
          {sortedReviews.map((review) => (
            <article key={review.id}>
              <div>
                <h2>{review.title}</h2>
                <p>
                  {review.category}
                  {review.breed ? ` · ${review.breed}` : ""} · {review.published ? "공개" : "임시저장"}
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
          ))}
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
              <button className="admin-button is-secondary" onClick={closeThumbnailEditor} type="button">
                닫기
              </button>
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
                  <button
                    className="admin-button is-secondary"
                    onClick={() => {
                      const crop = centeredSquareCrop(cropImage.width, cropImage.height);
                      setCropDraft(crop);
                      setThumbnailCrop(crop);
                    }}
                    type="button"
                  >
                    가운데 맞춤
                  </button>
                  <button className="admin-button" onClick={applyThumbnailCrop} type="button">
                    영역 적용
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
