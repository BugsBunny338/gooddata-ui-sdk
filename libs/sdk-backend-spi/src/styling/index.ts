// (C) 2019 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";

/**
 * This service provides access to workspace styling settings such as color palette.
 *
 * The contract here is that styling settings ARE applied in Analytical Designer and Dashboard applications and
 * so any SDK code that embeds entities created by those applications MUST also use the same styling settings in
 * order to maintain consistent user experience.
 *
 * @public
 */
export interface IWorkspaceStylingService {
    /**
     * Asynchronously returns items in the color palette.
     */
    colorPalette(): Promise<IColorPalette>;
}
