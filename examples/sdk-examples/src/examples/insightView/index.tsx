// (C) 2007-2019 GoodData Corporation
import React from "react";

import "@gooddata/sdk-ui-ext/styles/css/insightView.css";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { InsightViewColumnChartByIdentifierExample } from "./InsightViewColumnChartByIdentifierExample";
import { InsightViewComboChartByIdentifierExample } from "./InsightViewComboChartByIdentifierExample";
// import insightViewTableExample from "../components/insightViewTableByIdentifierExample";
// import CustominsightViewExample from "../components/CustominsightViewExample";
import { InsightViewBarByIdentifierExample } from "./InsightViewBarByIdentifierExample";
import { InsightViewLineByIdentifierExample } from "./InsightViewLineByIdentifierExample";
import { InsightViewAreaByIdentifierExample } from "./InsightViewAreaByIdentifierExample";
import { InsightViewHeadlineByIdentifierExample } from "./InsightViewHeadlineByIdentifierExample";
import { InsightViewScatterByIdentifierExample } from "./InsightViewScatterByIdentifierExample";
import { InsightViewBubbleByIdentifierExample } from "./InsightViewBubbleByIdentifierExample";
import { InsightViewPieByIdentifierExample } from "./InsightViewPieByIdentifierExample";
import { InsightViewDonutByIdentifierExample } from "./InsightViewDonutByIdentifierExample";
import { InsightViewTreemapByIdentifierExample } from "./InsightViewTreemapByIdentifierExample";
import { InsightViewHeatmapByIdentifierExample } from "./InsightViewHeatmapByIdentifierExample";

import InsightViewColumnChartByIdentifierExampleSRC from "!raw-loader!./InsightViewColumnChartByIdentifierExample";
import InsightViewComboChartByIdentifierExampleSRC from "!raw-loader!./InsightViewComboChartByIdentifierExample";
// import insightViewTableExampleSRC from "!raw-loader!./insightViewTableByIdentifierExample";
// import CustominsightViewExampleSRC from "!raw-loader!./CustominsightViewExample";
import InsightViewBarByIdentifierExampleSrc from "!raw-loader!./InsightViewBarByIdentifierExample";
import InsightViewLineByIdentifierExampleSRC from "!raw-loader!./InsightViewLineByIdentifierExample";
import InsightViewAreaByIdentifierExampleSRC from "!raw-loader!./InsightViewAreaByIdentifierExample";
import InsightViewHeadlineByIdentifierExampleSRC from "!raw-loader!./InsightViewHeadlineByIdentifierExample";
import InsightViewScatterByIdentifierExampleSRC from "!raw-loader!./InsightViewScatterByIdentifierExample";
import InsightViewBubbleByIdentifierExampleSRC from "!raw-loader!./InsightViewBubbleByIdentifierExample";
import InsightViewPieByIdentifierExampleSRC from "!raw-loader!./InsightViewPieByIdentifierExample";
import InsightViewDonutByIdentifierExampleSRC from "!raw-loader!./InsightViewDonutByIdentifierExample";
import InsightViewTreemapByIdentifierExampleSRC from "!raw-loader!./InsightViewTreemapByIdentifierExample";
import InsightViewHeatmapByIdentifierExampleSRC from "!raw-loader!./InsightViewHeatmapByIdentifierExample";

export const InsightView = () => (
    <div>
        <h1>InsightView by identifier</h1>

        <p>
            These are the examples of the generic insightView component that uses identifier to identify
            insights.
        </p>

        <hr className="separator" />

        <h2 id="column-chart">Column Chart</h2>
        <ExampleWithSource
            for={InsightViewColumnChartByIdentifierExample}
            source={InsightViewColumnChartByIdentifierExampleSRC}
        />

        <hr className="separator" />
        {/*         
        <h2 id="table">Table</h2>
        <ExampleWithSource for={insightViewTableExample} source={insightViewTableExampleSRC} />
        
        <hr className="separator" /> 
        <h2 id="custom">Custom insightView</h2>
        <p>
            Using <a href="https://github.com/recharts/recharts">Recharts library</a>
        </p>
        <ExampleWithSource for={CustominsightViewExample} source={CustominsightViewExampleSRC} />

       
        <hr className="separator" />
        */}

        <h2 id="bar">Bar Chart</h2>
        <ExampleWithSource
            for={InsightViewBarByIdentifierExample}
            source={InsightViewBarByIdentifierExampleSrc}
        />

        <hr className="separator" />

        <h2 id="line">Line Chart</h2>
        <ExampleWithSource
            for={InsightViewLineByIdentifierExample}
            source={InsightViewLineByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="area">Stacked Area Chart</h2>
        <ExampleWithSource
            for={InsightViewAreaByIdentifierExample}
            source={InsightViewAreaByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="headline">Headline</h2>
        <ExampleWithSource
            for={InsightViewHeadlineByIdentifierExample}
            source={InsightViewHeadlineByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="scatter">Scatter Plot</h2>
        <ExampleWithSource
            for={InsightViewScatterByIdentifierExample}
            source={InsightViewScatterByIdentifierExampleSRC}
        />

        <hr className="separator" />
        <h2 id="bubble">Bubble Chart</h2>
        <ExampleWithSource
            for={InsightViewBubbleByIdentifierExample}
            source={InsightViewBubbleByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="pie">Pie Chart</h2>
        <ExampleWithSource
            for={InsightViewPieByIdentifierExample}
            source={InsightViewPieByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="donut">Donut Chart</h2>
        <ExampleWithSource
            for={InsightViewDonutByIdentifierExample}
            source={InsightViewDonutByIdentifierExampleSRC}
        />

        <hr className="separator" />
        <h2 id="treemap">Treemap</h2>
        <ExampleWithSource
            for={InsightViewTreemapByIdentifierExample}
            source={InsightViewTreemapByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="heatmap">Heatmap</h2>
        <ExampleWithSource
            for={InsightViewHeatmapByIdentifierExample}
            source={InsightViewHeatmapByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="combo">Combo Chart</h2>
        <ExampleWithSource
            for={InsightViewComboChartByIdentifierExample}
            source={InsightViewComboChartByIdentifierExampleSRC}
        />
    </div>
);
