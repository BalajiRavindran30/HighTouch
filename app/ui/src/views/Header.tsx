import classNames from "classnames";
import { useEffect, useState } from "react";
import { User } from "vimeo";
import { client as vimeoClient } from "../vimeoClient";

import { StandardIcon } from "../components/icons/StandardIcon";
import { SimpleMenuItem } from "../components/SimpleMenuItem";

export function Header() {
    const [user, setUser] = useState<User>({
        name: "Unknown",
        link: "#",
    });

    useEffect(() => {
        async function getUser(): Promise<void> {
            const resp = await vimeoClient.get<User>("/api/vimeo/user/me");
            setUser(resp.data);
        }

        getUser().catch(console.error);
    }, []);

    const [showMenu, setShowMenu] = useState(false);

    const menuTriggerClassNames = classNames(
        "slds-dropdown-trigger",
        "slds-dropdown-trigger_click",
        { "slds-is-open": showMenu }
    );

    const icon = !user.pictures ? (
        <StandardIcon iconName="user" svgClass="slds-avatar_medium" />
    ) : (
        <img src={user.pictures.sizes[0].link} alt={user.name} />
    );

    return (
        <header className="slds-global-header_container">
            <div className="slds-global-header slds-grid slds-grid_align-spread">
                <div className="slds-global-header__item"></div>
                <div className="slds-global-header__item slds-global-header__item_search"></div>
                <div className="slds-global-header__item">
                    <ul className="slds-global-actions">
                        <li className="slds-global-actions__item">
                            <div className={menuTriggerClassNames}>
                                <button
                                    className="slds-button slds-global-actions__item-action"
                                    title="person name"
                                    aria-haspopup="true"
                                    aria-expanded={showMenu}
                                    onClick={() => setShowMenu(!showMenu)}
                                >
                                    <span className="slds-avatar">
                                        <span className="slds-icon_container slds-icon-standard-user">
                                            {icon}
                                        </span>
                                    </span>
                                </button>
                                <div className="slds-dropdown slds-dropdown_right">
                                    <ul
                                        className="slds-dropdown__list"
                                        role="menu"
                                        aria-label="Show More"
                                    >
                                        <SimpleMenuItem
                                            id="user"
                                            label={user.name}
                                            href={user.link}
                                        />
                                        <li
                                            className="slds-has-divider_top-space"
                                            role="separator"
                                        ></li>
                                        <SimpleMenuItem
                                            id="logout"
                                            label="Logout"
                                            href="/logout"
                                        />
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
