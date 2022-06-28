import svgUrl from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";

interface Props {
    svgClass?: string;
    iconName: string;
}

export function StandardIcon(props: Props) {
    return (
        <svg className={props.svgClass} aria-hidden="true">
            <use xlinkHref={`${svgUrl}#${props.iconName}`}></use>
        </svg>
    );
}
