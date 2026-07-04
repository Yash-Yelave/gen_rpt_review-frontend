import { onRequestGet as __api_reports__id__comments_ts_onRequestGet } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id]\\comments.ts"
import { onRequestPost as __api_reports__id__comments_ts_onRequestPost } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id]\\comments.ts"
import { onRequestPut as __api_reports__id__content_ts_onRequestPut } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id]\\content.ts"
import { onRequestGet as __api_reports__id__report_ts_onRequestGet } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id]\\report.ts"
import { onRequestGet as __api_reports__id__review_ts_onRequestGet } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id]\\review.ts"
import { onRequestPost as __api_reports__id__status_ts_onRequestPost } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id]\\status.ts"
import { onRequestGet as __api_reports__id__ts_onRequestGet } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\[id].ts"
import { onRequestGet as __api_reports_index_ts_onRequestGet } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\api\\reports\\index.ts"
import { onRequest as ___middleware_ts_onRequest } from "D:\\BlueOcean\\gen_rpt_review-frontend-main\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/reports/:id/comments",
      mountPath: "/api/reports/:id",
      method: "GET",
      middlewares: [],
      modules: [__api_reports__id__comments_ts_onRequestGet],
    },
  {
      routePath: "/api/reports/:id/comments",
      mountPath: "/api/reports/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_reports__id__comments_ts_onRequestPost],
    },
  {
      routePath: "/api/reports/:id/content",
      mountPath: "/api/reports/:id",
      method: "PUT",
      middlewares: [],
      modules: [__api_reports__id__content_ts_onRequestPut],
    },
  {
      routePath: "/api/reports/:id/report",
      mountPath: "/api/reports/:id",
      method: "GET",
      middlewares: [],
      modules: [__api_reports__id__report_ts_onRequestGet],
    },
  {
      routePath: "/api/reports/:id/review",
      mountPath: "/api/reports/:id",
      method: "GET",
      middlewares: [],
      modules: [__api_reports__id__review_ts_onRequestGet],
    },
  {
      routePath: "/api/reports/:id/status",
      mountPath: "/api/reports/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_reports__id__status_ts_onRequestPost],
    },
  {
      routePath: "/api/reports/:id",
      mountPath: "/api/reports",
      method: "GET",
      middlewares: [],
      modules: [__api_reports__id__ts_onRequestGet],
    },
  {
      routePath: "/api/reports",
      mountPath: "/api/reports",
      method: "GET",
      middlewares: [],
      modules: [__api_reports_index_ts_onRequestGet],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]