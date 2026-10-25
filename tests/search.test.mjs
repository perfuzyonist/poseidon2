import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesProduct } from "../src/lib/search.ts";

const filter = {
  name: "Dış Filtre 800 L/h",
  category: "Ekipmanlar",
  description: "Mekanik ve biyolojik filtrasyon",
};
test("search handles Turkish letters and separate words across product fields", () => {
  assert.equal(matchesProduct(filter, "DIS FILTRE"), true);
  assert.equal(matchesProduct(filter, "filtre ekipman"), true);
  assert.equal(matchesProduct(filter, "  biyolojik  filtre "), true);
  assert.equal(
    matchesProduct({ ...filter, name: "Işık Şeridi" }, "isik seridi"),
    true,
  );
  assert.equal(matchesProduct(filter, "olmayan"), false);
  assert.equal(matchesProduct(filter, "filtre olmayan"), false);
  assert.equal(matchesProduct(filter, ""), true);
});
