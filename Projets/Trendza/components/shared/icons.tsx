"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faArrowRight,
  faBars,
  faArrowTrendUp,
  faBagShopping,
  faBox,
  faBoxesStacked,
  faBullseye,
  faCalendarDays,
  faChartColumn,
  faCheck,
  faChevronDown,
  faCircleCheck,
  faCircleInfo,
  faCircleNotch,
  faClock,
  faCompass,
  faCopy,
  faCreditCard,
  faDownload,
  faEnvelope,
  faEnvelopeCircleCheck,
  faFileArrowUp,
  faFileLines,
  faFire,
  faGaugeHigh,
  faHeart,
  faList,
  faLocationDot,
  faLock,
  faMagnifyingGlassChart,
  faMobile,
  faPen,
  faPlus,
  faRightFromBracket,
  faRocket,
  faRotateLeft,
  faRotateRight,
  faSearch,
  faShieldHalved,
  faStar,
  faStore,
  faTag,
  faTrash,
  faTriangleExclamation,
  faUpload,
  faUserCheck,
  faUsers,
  faXmark,
  faTrophy,
  faGlobe,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

type IconProps = {
  className?: string;
};

function makeIcon(name: string, icon: IconDefinition) {
  function Icon({ className }: IconProps) {
    return <FontAwesomeIcon icon={icon} className={className} aria-hidden />;
  }
  Icon.displayName = name;
  return Icon;
}

export const AlertTriangle = makeIcon("AlertTriangle", faTriangleExclamation);
export const ArrowLeft = makeIcon("ArrowLeft", faArrowLeft);
export const ArrowRight = makeIcon("ArrowRight", faArrowRight);
export const Calendar = makeIcon("Calendar", faCalendarDays);
export const Check = makeIcon("Check", faCheck);
export const CheckCircle2 = makeIcon("CheckCircle2", faCircleCheck);
export const ChevronDown = makeIcon("ChevronDown", faChevronDown);
export const Clock = makeIcon("Clock", faClock);
export const Compass = makeIcon("Compass", faCompass);
export const Copy = makeIcon("Copy", faCopy);
export const CreditCard = makeIcon("CreditCard", faCreditCard);
export const Download = makeIcon("Download", faDownload);
export const FileText = makeIcon("FileText", faFileLines);
export const FileUp = makeIcon("FileUp", faFileArrowUp);
export const Flame = makeIcon("Flame", faFire);
export const Gauge = makeIcon("Gauge", faGaugeHigh);
export const Heart = makeIcon("Heart", faHeart);
export const Info = makeIcon("Info", faCircleInfo);
export const LayoutDashboard = makeIcon("LayoutDashboard", faChartColumn);
export const List = makeIcon("List", faList);
export const Loader2 = makeIcon("Loader2", faCircleNotch);
export const Lock = makeIcon("Lock", faLock);
export const LogOut = makeIcon("LogOut", faRightFromBracket);
export const Mail = makeIcon("Mail", faEnvelope);
export const Menu = makeIcon("Menu", faBars);
export const MailCheck = makeIcon("MailCheck", faEnvelopeCircleCheck);
export const MapPin = makeIcon("MapPin", faLocationDot);
export const Package = makeIcon("Package", faBox);
export const PackagePlus = makeIcon("PackagePlus", faBoxesStacked);
export const PackageSearch = makeIcon("PackageSearch", faMagnifyingGlassChart);
export const Pencil = makeIcon("Pencil", faPen);
export const Plus = makeIcon("Plus", faPlus);
export const RefreshCw = makeIcon("RefreshCw", faRotateRight);
export const Rocket = makeIcon("Rocket", faRocket);
export const RotateCcw = makeIcon("RotateCcw", faRotateLeft);
export const Search = makeIcon("Search", faSearch);
export const ShieldAlert = makeIcon("ShieldAlert", faShieldHalved);
export const ShieldCheck = makeIcon("ShieldCheck", faShieldHalved);
export const ShoppingBag = makeIcon("ShoppingBag", faBagShopping);
export const Smartphone = makeIcon("Smartphone", faMobile);
export const Star = makeIcon("Star", faStar);
export const Store = makeIcon("Store", faStore);
export const Tag = makeIcon("Tag", faTag);
export const Target = makeIcon("Target", faBullseye);
export const Trash2 = makeIcon("Trash2", faTrash);
export const TrendingUp = makeIcon("TrendingUp", faArrowTrendUp);
export const TriangleAlert = makeIcon("TriangleAlert", faTriangleExclamation);
export const Upload = makeIcon("Upload", faUpload);
export const UserCheck = makeIcon("UserCheck", faUserCheck);
export const Users = makeIcon("Users", faUsers);
export const X = makeIcon("X", faXmark);
export const Trophy = makeIcon("Trophy", faTrophy);
export const Globe = makeIcon("Globe", faGlobe);
export const LineChart = makeIcon("LineChart", faChartLine);
