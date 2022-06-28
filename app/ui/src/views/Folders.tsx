import { Dropdown } from "@salesforce/design-system-react";
import { useEffect, useState } from "react";

import { Folder, ListResponse } from "vimeo";

import { client as vimeoClient } from "../vimeoClient";

interface Props {
    folderSelected: (uri: string) => void;
}

interface MenuItem {
    label: string;
    value: string;
}

export function Folders(props: Props) {
    const [folders, setFolders] = useState<Folder[]>();
    const [selectedFolderName, setSelectedFolderName] = useState<string>();
    const [selectedFolderUri, setSelectedFolderUri] = useState<string>();

    useEffect(() => {
        async function getFolders() {
            const resp = await vimeoClient.get<ListResponse<Folder>>(
                "/api/vimeo/user/me/folders"
            );
            const data = resp.data.data;
            setFolders(data);
            setSelectedFolderName(data[0].name);
            setSelectedFolderUri(data[0].uri);
        }

        getFolders().catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedFolderUri) {
            return;
        }

        props.folderSelected(selectedFolderUri);
    });

    function onSelect(item: MenuItem) {
        setSelectedFolderName(item.label);
        setSelectedFolderUri(item.value);
    }

    return (
        <>
            {folders && folders.length > 0 ? (
                <Dropdown
                    buttonVariant="base"
                    align="right"
                    iconCategory="utility"
                    iconName="down"
                    iconPosition="right"
                    label={selectedFolderName}
                    onSelect={onSelect}
                    options={folders.map((f) => ({
                        label: f.name,
                        value: f.uri,
                    }))}
                />
            ) : (
                "Loading folders..."
            )}
        </>
    );
}
