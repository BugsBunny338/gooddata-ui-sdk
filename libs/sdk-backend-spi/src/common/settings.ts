// (C) 2020 GoodData Corporation

/**
 *
 * This enum lists notable settings that should work across implementations of Analytical Backends.
 *
 * @public
 */
export enum SettingCatalog {
    /**
     * Headline component will not be underlined when it is set up with drilling.
     */
    disableKpiDashboardHeadlineUnderline = "disableKpiDashboardHeadlineUnderline",

    /**
     * Allows configuration of axis name position and visibility for Pluggable Visualizations.
     */
    enableAxisNameConfiguration = "enableAxisNameConfiguration",
}

/**
 * Settings are obtained from backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value. Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings {
    [key: string]: number | boolean | string;
}

/**
 * Settings for particular user.
 *
 * @public
 */
export interface IUserSettings extends ISettings {
    /**
     * User to which the settings belong.
     */
    userId: string;
}

/**
 * Settings for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettings extends ISettings {
    /**
     * Workspace to which the settings belong.
     */
    workspace: string;
}

/**
 * Settings for particular combination of user and workspace.
 *
 * @public
 */
export interface IUserWorkspaceSettings extends IUserSettings, IWorkspaceSettings {}
