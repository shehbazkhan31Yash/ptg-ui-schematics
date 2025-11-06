import { noop, Rule } from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";
import { addDepsToPackageJson } from "../utils/package-utils";

export function setNGRX(options: ApplicationOptions): Rule {
 if (!options.ngrx) return noop;
 
 return addDepsToPackageJson({
  "@ngrx/store": "^18.1.1",
  "@ngrx/effects": "^18.1.1",
  "@ngrx/entity": "^18.1.1",
  "@ngrx/store-devtools": "^18.1.1",
 });
}