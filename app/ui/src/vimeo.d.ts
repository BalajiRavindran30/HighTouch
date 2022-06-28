// Many of these interfaces only have a subset of the properties
// that the Vimeo API returns.

declare module "vimeo" {
    export interface PictureSize {
        width: number;
        height: number;
        link: string;
    }

    export interface Picture {
        uri: string;
        active: boolean;
        type: string;
        base_link: string;
        sizes: PictureSize[];
    }

    // https://developer.vimeo.com/api/reference/users#get_user
    export interface User {
        name: string;
        link: string;
        primary_email?: string;
        pictures?: Picture;
    }

    export interface AncestorPath {
        name: string;
        uri: string;
    }

    export interface ConnectionItem {
        uri: string;
        options: string[];
        total?: number;
    }

    export interface FolderConnections {
        /**
         * The breadcrumb path to the top-most parent,
         * if a folder is a sub-folder.
         */
        ancestor_path: AncestorPath[];
        /**
         * Indicates if a folder has any sub-folers and
         * if so, how many using the embedded `total`
         * property of `ConnectionItem`.
         */
        folders: ConnectionItem;
        items: ConnectionItem;
        /**
         * If a folder is a sub-folder, this will be
         * non-null.
         */
        parent_folder?: ConnectionItem;
        /**
         * Indicates if a folder has any videos and
         * if so, how many using the embedded `total`
         * property of `ConnectionItem`.
         */
        videos: ConnectionItem;
    }

    export interface FolderMetadata {
        connections: FolderConnections;
    }

    export interface Folder {
        name: string;
        uri: string;
        metadata: FolderMetadata;
    }

    export interface Paging {
        next?: string;
        previous?: string;
        first: string;
        last: string;
    }

    export interface Privacy {
        view: string;
        embed: string;
        download: boolean;
        add: false;
        comments: string;
    }

    export interface Video {
        name: string;
        description: string;

        created_time: string;
        /**
         * The duration of the video in seconds.
         */
        duration: number;
        /**
         * The link to the video on vimeo.com.
         */
        link: string;
        pictures: Picture;
        player_embed_url: string;
        privacy: Privacy;
        /**
         * The API URI for this video.
         */
        uri: string;
    }

    export interface ListResponse<T> {
        total: number;
        page: number;
        per_page: number;
        paging: Paging;
        data: T[];
    }
}
