import { defineMcp } from "@lovable.dev/mcp-js";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";

export default defineMcp({
  name: "ng-property-hub-mcp",
  title: "New Guard Property Hub",
  version: "0.1.0",
  instructions:
    "Tools for browsing U.S. real estate listings on New Guard Property Hub. Use `search_properties` to find listings by city, state, price, bedrooms, or property type. Use `get_property` to fetch full details of a specific listing by id.",
  tools: [searchProperties, getProperty],
});
