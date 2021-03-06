#! /usr/bin/env yarn jest

import { CovidExplorer } from "./CovidExplorer"
import { CovidQueryParams } from "explorer/covidExplorer/CovidParams"
import { covidSampleRows } from "./CovidSampleRows"
import React from "react"
import { shallow, mount, ReactWrapper } from "enzyme"
import { MetricOptions } from "explorer/covidExplorer/CovidConstants"
import { defaultTo } from "grapher/utils/Util"

const dummyMeta = {
    charts: {},
    variables: {},
}

describe(CovidExplorer, () => {
    it("renders the Covid Data Explorer", () => {
        const startingParams = new CovidQueryParams("")
        const element = shallow(
            <CovidExplorer
                data={covidSampleRows}
                params={startingParams}
                covidChartAndVariableMeta={dummyMeta}
                updated="2020-05-09T18:59:31"
            />
        )

        const headerText = element.find(".ExplorerHeaderBox").text()

        // Need to split it off because the lines are in separate elements
        expect(headerText).toContain("Coronavirus Pandemic")
        expect(headerText).toContain("Data Explorer")
    })
})
class ExplorerDataTableTest {
    params: CovidQueryParams
    view: ReactWrapper

    static defaultQueryString: string =
        "?tab=table&tableMetrics=cases~deaths~tests~tests_per_case~case_fatality_rate~positive_test_rate"

    static get defaultParams() {
        return new CovidQueryParams(ExplorerDataTableTest.defaultQueryString)
    }

    constructor(params?: CovidQueryParams) {
        this.params = defaultTo(params, ExplorerDataTableTest.defaultParams)

        this.view = mount(
            <CovidExplorer
                data={covidSampleRows}
                params={this.params}
                queryStr="?tab=table&time=2020-05-06"
                covidChartAndVariableMeta={dummyMeta}
                updated="2020-05-09T18:59:31"
            />
        )
    }

    // untested with subheaders
    get headers() {
        return this.view
            .find("thead tr")
            .first()
            .find("th span.name")
            .map((tableHeader) => tableHeader.text())
    }

    bodyRow(index: number) {
        return this.view
            .find("tbody tr")
            .at(index)
            .find("td")
            .map((td) => td.text())
    }
}

describe("When you try to create a multimetric Data Explorer", () => {
    let dataTableTester: ExplorerDataTableTest
    beforeAll(() => {
        dataTableTester = new ExplorerDataTableTest()
    })

    it("renders a table", () => {
        expect(dataTableTester.view.find("table")).toHaveLength(1)
    })

    it("renders correct table headers", () => {
        expect(dataTableTester.headers).toEqual([
            "Confirmed cases",
            "Confirmed deaths",
            "Tests",
            "Tests per confirmed case",
            "Case fatality rate",
            "Share of positive tests",
        ])
    })

    const SECOND_ROW = [
        "United States",
        "1.20 million",
        "71,078",
        "May 5 7.54 million",
        "May 5 6",
        "5.9",
        "May 5 0.2",
    ]

    it("renders correct table rows", () => {
        expect(dataTableTester.bodyRow(1)).toEqual(SECOND_ROW)
    })

    describe("when you have fewer metrics", () => {
        let dataTableTester: ExplorerDataTableTest
        beforeAll(() => {
            const explorerParams = new CovidQueryParams(
                "?tab=table&tableMetrics=cases~deaths~tests_per_case"
            )
            dataTableTester = new ExplorerDataTableTest(explorerParams)
        })

        test("table headers show only the metrics you select", () => {
            expect(dataTableTester.headers).toEqual([
                "Confirmed cases",
                "Confirmed deaths",
                "Tests per confirmed case",
            ])
        })
    })

    describe("It doesn't change when", () => {
        it("explorer metrics change", () => {
            MetricOptions.forEach((metric) => {
                const params = ExplorerDataTableTest.defaultParams
                params.setMetric(metric)
                const dataTableTester = new ExplorerDataTableTest(params)
                expect(dataTableTester.bodyRow(1)).toEqual(SECOND_ROW)
            })
        })

        it("'align outbreaks' is enabled", () => {
            const params = ExplorerDataTableTest.defaultParams
            params.aligned = true
            const dataTableTester = new ExplorerDataTableTest(params)
            expect(dataTableTester.bodyRow(1)).toEqual(SECOND_ROW)
        })
    })

    describe("It changes when", () => {
        test("'per capita' is enabled", () => {
            const params = ExplorerDataTableTest.defaultParams
            params.perCapita = true
            const dataTableTester = new ExplorerDataTableTest(params)

            expect(dataTableTester.bodyRow(1)).toEqual([
                "United States",
                "602.24 million",
                "35.54 million",
                "May 5 3.77 million",
                "May 5 6",
                "5.9",
                "May 5 0.2",
            ])
        })

        describe("interval is changed", () => {
            test("interval is set to daily", () => {
                const params = ExplorerDataTableTest.defaultParams
                params.interval = "daily"
                const dataTableTester = new ExplorerDataTableTest(params)

                expect(dataTableTester.bodyRow(1)).toEqual([
                    "United States",
                    "1.20 million",
                    "23,841",
                    "71,078",
                    "2,144",
                    "May 5 7.54 million",
                    "May 5 258,954",
                    "May 5 6",
                    "5.9",
                    "May 5 0.2",
                ])
            })

            test("interval is set to weekly change", () => {
                const params = ExplorerDataTableTest.defaultParams
                params.interval = "weekly"
                const dataTableTester = new ExplorerDataTableTest(params)

                expect(dataTableTester.bodyRow(1)).toEqual([
                    "United States",
                    "1.20 million",
                    "162,519.0",
                    "71,078",
                    "11,886.0",
                    "May 5 7.54 million",
                    "May 5 6",
                    "5.9",
                    "May 5 0.2",
                ])
            })
        })
    })
})
