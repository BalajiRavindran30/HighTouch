import { ChangeEvent, useEffect, useState, KeyboardEvent } from "react";
import { useParams } from "react-router-dom";

import { Spinner } from "@salesforce/design-system-react";

import { Privacy, Video } from "vimeo";
import { client as vimeoClient } from "../vimeoClient";

import debounce from "lodash.debounce";
import classNames from "classnames";

export function BasicSettings() {
    const params = useParams();
    const [video, setVideo] = useState<Video>();
    const [loading, setLoading] = useState(false);
    const [nameInvalid, setNameInvalid] = useState(false);

    useEffect(() => {
        async function getVideo() {
            setLoading(true);
            const videoId = params.videoId;
            const resp = await vimeoClient.get<Video>(
                `/api/vimeo/videos/${videoId}`
            );
            setVideo(resp.data);
        }

        getVideo()
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [params]);

    function onKeyupName(e: KeyboardEvent) {
        const value = (e.target as HTMLInputElement).value;
        if (!value) {
            setNameInvalid(true);
            return;
        }
        setNameInvalid(false);
    }

    async function onNameChange(e: ChangeEvent) {
        const value = (e.target as HTMLInputElement).value;
        if (!value) {
            return;
        }

        const videoId = params.videoId;
        const resp = await vimeoClient.patch<Video>(
            `/api/vimeo/videos/${videoId}`,
            {
                name: value,
            }
        );
        setVideo(resp.data);
    }

    async function onDescriptionChange(e: ChangeEvent) {
        const videoId = params.videoId;
        const resp = await vimeoClient.patch<Video>(
            `/api/vimeo/videos/${videoId}`,
            {
                description: (e.target as HTMLTextAreaElement).value,
            }
        );
        setVideo(resp.data);
    }

    async function onUpdatePrivacy(e: ChangeEvent, field: keyof Privacy) {
        const videoId = params.videoId;
        const update: any = {};
        update[field] = (e.target as HTMLSelectElement).value;
        const resp = await vimeoClient.patch<Video>(
            `/api/vimeo/videos/${videoId}`,
            {
                privacy: update,
            },
            {
                headers: {
                    "Content-Type":
                        field === "view"
                            ? // Note that our server should accept this as a content-type
                              // in its incoming body parser settings. So if this is
                              // changed, ensure that the Express-based service's
                              // `bodyParser` middleware accepts the new string
                              // AND is able to parse the content type.
                              "application/vnd.vimeo.video"
                            : "application/json",
                },
            }
        );
        setVideo(resp.data);
    }

    async function onDownloadStatusChange(e: ChangeEvent) {
        const videoId = params.videoId;
        const resp = await vimeoClient.patch<Video>(
            `/api/vimeo/videos/${videoId}`,
            {
                privacy: {
                    download: (e.target as HTMLInputElement).checked,
                },
            },
            {
                headers: {
                    "Content-Type": "application/vnd.vimeo.video",
                },
            }
        );
        setVideo(resp.data);
    }

    return (
        <>
            {loading && <Spinner />}
            {video && (
                <div className="slds-grid">
                    <div className="slds-col slds-col slds-size_1-of-3">
                        <div
                            className={classNames([
                                "slds-form-element",
                                "slds-var-m-bottom_large",
                                { "slds-has-error": nameInvalid },
                            ])}
                        >
                            <label className="slds-form-element__label slds-text-heading_small">
                                Title
                                <abbr
                                    className="slds-required"
                                    title="required"
                                >
                                    *
                                </abbr>
                            </label>
                            <div className="slds-form-element__control">
                                <input
                                    type="text"
                                    className="slds-input"
                                    defaultValue={video.name}
                                    onChange={debounce(onNameChange, 250)}
                                    onKeyUp={onKeyupName}
                                    required={true}
                                    aria-invalid={nameInvalid}
                                />
                            </div>
                            {nameInvalid && (
                                <div className="slds-form-element__help">
                                    Name is required
                                </div>
                            )}
                        </div>
                        <div className="slds-form-element slds-var-m-bottom_large">
                            <label className="slds-form-element__label slds-text-heading_small">
                                Description
                            </label>
                            <div className="slds-form-element__control">
                                <textarea
                                    className="slds-textarea"
                                    defaultValue={video.description}
                                    onChange={debounce(
                                        onDescriptionChange,
                                        250
                                    )}
                                ></textarea>
                            </div>
                        </div>
                        <div className="slds-form-element slds-var-m-bottom_large">
                            <label className="slds-form-element__label slds-text-heading_small">
                                Who can watch?
                            </label>
                            <div className="slds-form-element__control">
                                <div className="slds-select_container">
                                    <select
                                        className="slds-select"
                                        id="privacy"
                                        value={video?.privacy.view}
                                        onChange={(e) =>
                                            onUpdatePrivacy(e, "view")
                                        }
                                    >
                                        <option value="unlisted">
                                            Unlisted
                                        </option>
                                        <option value="password">
                                            Password
                                        </option>
                                        <option value="disable">
                                            Hide from Vimeo
                                        </option>
                                        <option value="nobody">Private</option>
                                        <option value="anybody">Public</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="slds-form-element slds-var-m-bottom_large">
                            <label className="slds-form-element__label slds-text-heading_small">
                                Where can this be embedded?
                            </label>
                            <div className="slds-form-element__control">
                                <div className="slds-select_container">
                                    <select
                                        className="slds-select"
                                        id="embed-location"
                                        value={video?.privacy.embed}
                                        onChange={(e) =>
                                            onUpdatePrivacy(e, "embed")
                                        }
                                    >
                                        <option value="private">Private</option>
                                        <option value="public">Anywhere</option>
                                        <option value="whitelist">
                                            Specific domains
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="slds-form-element slds-var-m-bottom_large">
                            <label className="slds-form-element__label slds-text-heading_small">
                                Who can comment?
                            </label>
                            <div className="slds-form-element__control">
                                <div className="slds-select_container">
                                    <select
                                        className="slds-select"
                                        id="embed-location"
                                        value={video?.privacy.comments}
                                        onChange={(e) =>
                                            onUpdatePrivacy(e, "comments")
                                        }
                                    >
                                        <option value="anybody">Anyone</option>
                                        <option value="none">No one</option>
                                        <option value="people-i-follow">
                                            People I follow
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="slds-form-element">
                            <label className="slds-checkbox_toggle slds-grid slds-grid_align-spread">
                                <span className="slds-form-element__label slds-m-bottom_none slds-text-heading_small">
                                    People can download this video
                                </span>
                                <input
                                    type="checkbox"
                                    name="people-can-download-toggle"
                                    aria-describedby="people-can-download-toggle"
                                    checked={video?.privacy.download || false}
                                    onChange={onDownloadStatusChange}
                                />
                                <span
                                    id="people-can-download-toggle"
                                    className="slds-checkbox_faux_container"
                                    aria-live="assertive"
                                >
                                    <span className="slds-checkbox_faux"></span>
                                </span>
                            </label>
                            <p className="slds-text-color_weak">
                                This applies to the review, video, and download
                                pages.
                            </p>
                        </div>
                    </div>
                    <div className="slds-col slds-col slds-size_2-of-3">
                        <iframe
                            className="slds-align_absolute-center"
                            src={video?.player_embed_url}
                            title={video?.name || ""}
                            allowFullScreen={true}
                            style={{
                                border: 0,
                                width: "1200px",
                                height: "600px",
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
