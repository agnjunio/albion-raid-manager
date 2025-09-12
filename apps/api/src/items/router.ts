import { logger } from "@albion-raid-manager/core/logger";
import { ItemsService } from "@albion-raid-manager/core/services";
import { APIErrorType, APIResponse, GetItem, SearchItems } from "@albion-raid-manager/types/api";
import { searchItemsQuerySchema } from "@albion-raid-manager/types/schemas";
import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";
import { validateRequest } from "@/request";

export const itemsRouter: Router = Router();
itemsRouter.use(auth);

/**
 * GET /items/search
 * Search for items by name
 *
 * Query parameters:
 * - q (required): Search term (minimum 2 characters)
 *   Supports Albion Online patterns like "8.1" (tier 8, enchant 1) or "T8.1"
 * - slotType (optional): Filter by item slot type
 * - limit (optional): Number of results to return (1-100, default: 20)
 * - offset (optional): Number of results to skip (default: 0)
 */
itemsRouter.get(
  "/search",
  validateRequest({ query: searchItemsQuerySchema }),
  async (
    req: Request<SearchItems.Params, {}, SearchItems.Query>,
    res: Response<APIResponse.Type<SearchItems.Response>>,
  ) => {
    try {
      const { q, slotType, limit, offset } = req.query as unknown as SearchItems.Query;

      if (!q || typeof q !== "string") {
        return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, "Search term is required"));
      }

      // Search items using the core service
      const result = await ItemsService.searchItemsByName(q, {
        slotType,
        limit,
        offset,
      });

      return res.json(APIResponse.Success(result));
    } catch (error) {
      logger.error("Items search error", { error, query: req.query });

      if (ServiceError.isServiceError(error)) {
        switch (error.code) {
          case ServiceErrorCode.NOT_FOUND:
            return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, error.message));
          default:
            return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, error.message));
        }
      }

      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Internal server error"));
    }
  },
);

/**
 * GET /items/:id
 * Get a specific item by its unique ID
 *
 * Path parameters:
 * - id (required): The unique item ID (e.g., "T8_2H_HOLYSTAFF@3")
 */
itemsRouter.get(
  "/:id",
  async (req: Request<GetItem.Params, {}, GetItem.Query>, res: Response<APIResponse.Type<GetItem.Response>>) => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, "Item ID is required"));
      }

      // Find item by unique name using the core service
      const item = await ItemsService.findItemById(id);

      if (!item) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Item not found"));
      }

      return res.json(APIResponse.Success({ item }));
    } catch (error) {
      logger.error("Get item error", { error, params: req.params });

      if (ServiceError.isServiceError(error)) {
        switch (error.code) {
          case ServiceErrorCode.NOT_FOUND:
            return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, error.message));
          default:
            return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, error.message));
        }
      }

      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Internal server error"));
    }
  },
);
