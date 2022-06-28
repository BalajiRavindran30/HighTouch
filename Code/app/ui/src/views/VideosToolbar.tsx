import { Input, InputIcon } from "@salesforce/design-system-react";
import { KeyboardEvent } from "react";

import debounce from "lodash.debounce";

import { Folders } from "./Folders";

interface Props {
    onFolderSelected: (uri: string) => void;
    numVideos?: number;
    onSearchChange: (event: KeyboardEvent, value: any) => void;
}

export function VideosToolbar(props: Props) {
    return (
        <div className="slds-grid slds-grid_align-spread">
            <div className="slds-col">
                <div
                    className="slds-var-m-bottom_medium"
                    style={{ display: "flex", flexFlow: "row nowrap" }}
                >
                    <Folders folderSelected={props.onFolderSelected} />
                    <span
                        style={{
                            color: "#9D9D9D",
                            marginTop: "0.275rem",
                            marginLeft: "0.5rem",
                        }}
                    >
                        {props.numVideos ?? 0} items
                    </span>
                </div>
            </div>
            <div className="slds-col">
                <div style={{ display: "flex", flexFlow: "row nowrap" }}>
                    <div className="slds-form-element__control slds-var-m-right_small">
                        <Input
                            id="videoSearchInput"
                            type="search"
                            onChange={debounce(props.onSearchChange, 250)}
                            iconLeft=""
                            iconRight={
                                <InputIcon name="search" category="utility" />
                            }
                        />
                    </div>
                    <div className="slds-form-element__control">
                        <a
                            href="https://vimeo.com/upload/videos"
                            target="_blank"
                            className="slds-button slds-button_brand"
                            rel="noreferrer"
                        >
                            Upload video
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
