import { useEffect, useState } from "react";
import { ListResponse, Video } from "vimeo";

import {
    Button,
    Card,
    Dropdown,
    DropdownTrigger,
    Spinner,
} from "@salesforce/design-system-react";

import { client as vimeoClient } from "../vimeoClient";
import { VideosToolbar } from "../views/VideosToolbar";
import { useNavigate } from "react-router-dom";

interface MenuItem {
    label: string;
    value: string;
}

const months = [
    "January",
    "February",
    "March",
    "April",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

/**
 * Returns the date formatted as MMM DD, YYYY.
 * @param d The ISO date string.
 */
function getFormattedDate(d: string): string {
    const date = new Date(d);
    return `${
        months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
}

export function Videos() {
    const [videos, setVideos] = useState<Video[]>();
    const [selectedFolder, setSelectedFolder] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState<string>();

    function onFolderSelected(uri: string) {
        setSelectedFolder(uri);
    }

    useEffect(() => {
        async function getFolderVideos() {
            if (!selectedFolder) {
                return;
            }

            setLoading(true);
            let query = "";
            if (searchInput) {
                query = `?query=${searchInput}`;
            }
            const resp = await vimeoClient.get<ListResponse<Video>>(
                `/api/vimeo/${selectedFolder}/videos${query}`
            );
            setVideos(resp.data.data);
        }

        getFolderVideos()
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedFolder, searchInput]);

    const navigate = useNavigate();

    function onSelect(item: MenuItem) {
        if (item.value.startsWith("https://")) {
            window.open(item.value, "_blank");
            return;
        }

        navigate(`${item.value}`);
    }

    const videoCards = videos?.map((v, idx) => {
        return (
            <div key={idx} className="slds-col slds-size_1-of-5">
                <Card heading="" bodyClassName="slds-card__body_inner">
                    <img
                        src={`${v.pictures.base_link}_295x166?r=pad`}
                        alt={v.name}
                    />
                    <div className="slds-var-m-top_small">
                        <div
                            style={{
                                display: "flex",
                                flexFlow: "row nowrap",
                                justifyContent: "space-between",
                            }}
                        >
                            <div className="slds-text-heading_small">
                                {v.name}
                            </div>
                            <Dropdown
                                options={[
                                    {
                                        label: "Create GIF",
                                        value: `${
                                            v.uri
                                        }/settings/gifs?title=${encodeURIComponent(
                                            v.name
                                        )}`,
                                    },
                                    {
                                        label: "Create thumbnail",
                                        value: `${
                                            v.uri
                                        }/settings/thumbnails?title=${encodeURIComponent(
                                            v.name
                                        )}`,
                                    },
                                    {
                                        label: "Embed in email",
                                        value: `${
                                            v.uri
                                        }/settings/email-embed?title=${encodeURIComponent(
                                            v.name
                                        )}`,
                                    },
                                    {
                                        label: "Trim video",
                                        value: "/trim-video",
                                    },
                                    { type: "divider" },
                                    { label: "View video", value: v.link },
                                    {
                                        label: "Settings",
                                        value: `${
                                            v.uri
                                        }/settings/basic?title=${encodeURIComponent(
                                            v.name
                                        )}`,
                                    },
                                ]}
                                onSelect={onSelect}
                            >
                                <DropdownTrigger>
                                    <Button
                                        variant="icon"
                                        iconCategory="action"
                                        iconName="more"
                                        iconSize="small"
                                        iconVariant="bare"
                                    />
                                </DropdownTrigger>
                            </Dropdown>
                        </div>
                        <span style={{ color: "#3F5465" }}>
                            {getFormattedDate(v.created_time)}
                        </span>
                    </div>
                </Card>
            </div>
        );
    });

    const emptyState = (
        <div className="slds-text-heading_small slds-align_absolute-center">
            There are no videos in this folder.
        </div>
    );

    return (
        <div>
            <VideosToolbar
                onFolderSelected={onFolderSelected}
                numVideos={videoCards?.length}
                onSearchChange={(e, v) => setSearchInput(v.value)}
            />
            {loading && <Spinner />}
            <div className="slds-grid slds-gutters">
                {videoCards && videoCards.length > 0 ? videoCards : emptyState}
            </div>
        </div>
    );
}
